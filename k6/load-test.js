import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Configuración
const BASE_URL = 'http://ms-purchase_app:4004/api/purchase';
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const params = {
  headers: headers,
  timeout: '15s'
};

// Métricas personalizadas
const successfulPurchases = new Counter('successful_purchases');
const successfulDeletions = new Counter('successful_deletions');
const failedPurchases = new Counter('failed_purchases');
const failedDeletions = new Counter('failed_deletions');
const successRate = new Rate('success_rate');

export const options = {
  setupTimeout: '30s',
  scenarios: {
    purchases: {
      executor: 'constant-arrival-rate',  // Ejecutor por tasa constante
      rate: 2,                           // Tasa de 2 iteraciones por segundo
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 3,                // VUs iniciales
      maxVUs: 6,                         // Máximo de VUs
      startTime: '5s'
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% de las peticiones en menos de 2s
    http_req_failed: ['rate<0.05'],      // Máximo 5% de fallos
    success_rate: ['rate>0.95']          // Tasa de éxito mayor al 95%
  },
};

// Función de reintento mejorada
const retryRequest = (request, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();

      if (response.status === 429) {  // Si se alcanza límite de tasa
        sleep(1);
        continue;
      }

      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      // Backoff con jitter
      if (i < maxRetries - 1) {
        sleep(Math.min(0.5 * Math.pow(2, i) + Math.random() * 0.5, 2));
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) sleep(0.5);
    }
  }
  throw lastError || new Error(`Request failed after ${maxRetries} attempts`);
};

export function setup() {
  console.log('Iniciando test de carga para el microservicio purchase...');
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const res = http.get(`${BASE_URL}/`);
    if (res.status === 200) {
      console.log('Servicio purchase listo para testing');
      sleep(2);
      return true;
    }
    console.log(`Esperando el servicio purchase... Quedan ${maxAttempts - i} intentos`);
    sleep(2);
  }
  throw new Error('Servicio purchase no disponible');
}

export default function() {
  // Generamos un payload con datos de compra.
  const payload = JSON.stringify({
    product_id: Math.floor(Math.random() * 3) + 1, // IDs entre 1 y 3
    quantity: 1  // Cantidad fija
  });

  try {
    // 1. Crear una compra
    const purchaseResponse = retryRequest(() => http.post(BASE_URL, payload, params));

    if (!purchaseResponse || purchaseResponse.status !== 201) {
      failedPurchases.add(1);
      return;
    }

    const purchaseSuccess = check(purchaseResponse, {
      'compra creada exitosamente': (r) => r.status === 201,
      'compra tiene un ID válido': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && body.id > 0;
        } catch (e) {
          return false;
        }
      }
    });

    if (purchaseSuccess) {
      successfulPurchases.add(1);
      const purchaseId = JSON.parse(purchaseResponse.body).id;

      sleep(0.5); // Tiempo de espera reducido

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

  sleep(0.5); // Tiempo de espera antes de la siguiente iteración
}
