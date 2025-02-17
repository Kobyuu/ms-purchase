import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Configuración de la URL base y headers para las peticiones
const BASE_URL = 'http://ms-purchase_app:4004/api/purchase';
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const params = {
  headers: headers,
  timeout: '10s'
};

// Métricas personalizadas
const successfulPurchases = new Counter('successful_purchases');
const successfulDeletions = new Counter('successful_deletions');
const failedPurchases = new Counter('failed_purchases');
const failedDeletions = new Counter('failed_deletions');
const successRate = new Rate('success_rate');

// Configuración de los escenarios de prueba y umbrales de rendimiento
export const options = {
  setupTimeout: '20s',
  scenarios: {
    purchases: {
      executor: 'constant-arrival-rate',
      rate: 2,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 3,
      maxVUs: 6,
      startTime: '5s'
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
    success_rate: ['rate>0.95']
  },
};

// Función de reintento de peticiones
const retryRequest = (request, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();

      if (response.status === 429) {  // Ratelimiter
        sleep(1);
        continue;
      }

      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      // Backoff ligero con jitter
      if (i < maxRetries - 1) {
        sleep(0.5 + Math.random() * 0.5);
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) sleep(0.5);
    }
  }
  throw lastError || new Error(`Request failed after ${maxRetries} attempts`);
};
// Funcion que verifica la disponibilidad del servicio antes de comenzar las pruebas de carga
export function setup() {
  console.log('Iniciando test de carga para el microservicio purchase...');
  for (let i = 0; i < 5; i++) {
    const res = http.get(`${BASE_URL}/`);
    if (res.status === 200) {
      console.log('Servicio purchase listo para testing');
      sleep(2);
      return;
    }
    console.log(`Esperando el servicio purchase... Intento ${i + 1}`);
    sleep(2);
  }
  throw new Error('Servicio purchase no disponible');
}
// Función principal de prueba que ejecuta el flujo completo de compra y eliminación
export default function() {
  const payload = JSON.stringify({
    product_id: 1,
    mailing_address: "Calle de Prueba 123"
  });

  try {
    // 1. Crear una compra
    const purchaseResponse = retryRequest(() => http.post(BASE_URL, payload, params));

    if (!purchaseResponse || purchaseResponse.status !== 201) {
      failedPurchases.add(1);
      successRate.add(0);
      return;
    }

    const purchaseBody = JSON.parse(purchaseResponse.body);

    const purchaseSuccess = check(purchaseResponse, {
      'compra creada exitosamente': (r) => r.status === 201,
      'compra tiene un ID válido': () => purchaseBody.purchase && purchaseBody.purchase.id > 0
    });

    if (purchaseSuccess) {
      successfulPurchases.add(1);
      const purchaseId = purchaseBody.purchase.id;

      sleep(0.5);

      // 2. Eliminar la compra
      const deletionResponse = retryRequest(() => http.del(`${BASE_URL}/${purchaseId}`, null, params));

      const deletionSuccess = check(deletionResponse, {
        'eliminación de compra exitosa': (r) => r.status === 200
      });

      if (deletionSuccess) {
        successfulDeletions.add(1);
        successRate.add(1);
      } else {
        failedDeletions.add(1);
        successRate.add(0);
      }
    }
  } catch (error) {
    console.error(`Error en la iteración de test: ${error.message}`);
    failedPurchases.add(1);
    successRate.add(0);
  }

  sleep(0.5);
}
