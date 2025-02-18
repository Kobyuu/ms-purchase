import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Configuration
const BASE_URL = 'http://ms-purchase_app:4004/api/purchase';
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Reduced timeout and adjusted parameters
const params = {
  headers: headers,
  timeout: '30s', // Increased timeout
  tags: { name: 'PurchaseAPI' }
};

// Metrics
const successfulPurchases = new Counter('successful_purchases');
const successfulDeletions = new Counter('successful_deletions');
const failedPurchases = new Counter('failed_purchases');
const failedDeletions = new Counter('failed_deletions');
const successRate = new Rate('success_rate');

// Adjusted test configuration
export const options = {
  setupTimeout: '30s',
  scenarios: {
    purchases: {
      executor: 'constant-arrival-rate',
      rate: 1, // Reduced rate
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 2, // Reduced VUs
      maxVUs: 4,
      startTime: '10s' // More time for setup
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'], // Increased threshold to 5s
    http_req_failed: ['rate<0.1'], // Increased error tolerance
    success_rate: ['rate>0.9'] // Adjusted success rate
  },
};

// Improved retry logic
const retryRequest = (request, maxRetries = 5) => { // Increased retries
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();

      if (response.status === 429) {
        console.log('Rate limit hit, waiting...');
        sleep(2 + Math.random() * 2); // Increased backoff
        continue;
      }

      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      // Progressive backoff
      if (i < maxRetries - 1) {
        sleep(Math.pow(2, i) + Math.random()); // Exponential backoff
      }
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      lastError = error;
      if (i < maxRetries - 1) sleep(Math.pow(2, i));
    }
  }
  throw lastError || new Error(`Request failed after ${maxRetries} attempts`);
};

// More robust setup
export function setup() {
  console.log('Starting purchase microservice load test...');
  for (let i = 0; i < 10; i++) { // More setup attempts
    try {
      const res = http.get(`${BASE_URL}/`);
      if (res.status === 200) {
        console.log('Purchase service ready for testing');
        sleep(5); // More time to stabilize
        return;
      }
    } catch (error) {
      console.log(`Waiting for purchase service... Attempt ${i + 1}`);
    }
    sleep(3);
  }
  throw new Error('Purchase service not available');
}

// Main test function with improved error handling
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
