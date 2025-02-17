import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// Configuration
const BASE_URL = 'http://ms-purchase_app:4004/api/purchase';

// Custom metrics
const successfulPurchases = new Counter('successful_purchases');
const failedPurchases = new Counter('failed_purchases');
const successfulGets = new Counter('successful_gets');
const failedGets = new Counter('failed_gets');
const successRate = new Rate('success_rate');

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const params = {
  headers: headers,
  timeout: '15s'
};

export const options = {
  setupTimeout: '30s',
  scenarios: {
    purchases: {
      executor: 'constant-arrival-rate',
      rate: 10,               // 10 iteraciones por segundo (20 requests/s total)
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 20,    // Número más realista de VUs
      maxVUs: 40,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% de requests en menos de 2s
    http_req_failed: ['rate<0.05'],     // Menos del 5% de errores
    success_rate: ['rate>0.95']         // 95% de éxito
  },
};

// Función de reintento mejorada
const retryRequest = (request, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = request();
      
      if (response.status === 429) {  // Rate limit
        sleep(1);
        continue;
      }
      
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      
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
  console.log('Starting purchase load test...');
  const maxAttempts = 5;
  
  for (let i = 0; i < maxAttempts; i++) {
    const res = http.get(BASE_URL);
    if (res.status === 200) {
      console.log('Purchase service ready for testing');
      sleep(2);
      return true;
    }
    console.log(`Waiting for service... ${maxAttempts - i} attempts remaining`);
    sleep(2);
  }
  throw new Error('Purchase service unavailable');
}

export default function() {
  try {
    const uniqueId = `${__VU}-${__ITER}`;
    const payload = JSON.stringify({
      product_id: Math.floor(Math.random() * 3) + 1,
      mailing_address: `Test Address ${uniqueId}`
    });

    // Create purchase
    const purchase = retryRequest(() => http.post(BASE_URL, payload, params));
    
    const purchaseSuccess = check(purchase, {
      'purchase created successfully': (r) => r.status === 201,
      'purchase has valid JSON': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body && body.purchase;
        } catch (e) {
          return false;
        }
      }
    });

    if (purchaseSuccess) {
      successfulPurchases.add(1);
      successRate.add(1);
    } else {
      failedPurchases.add(1);
      successRate.add(0);
    }

    sleep(0.5); // Espera entre operaciones

    // Get purchases
    const getPurchases = retryRequest(() => http.get(BASE_URL, params));
    
    const getSuccess = check(getPurchases, {
      'get purchases successful': (r) => r.status === 200,
      'get purchases has valid JSON': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data);
        } catch (e) {
          return false;
        }
      }
    });

    if (getSuccess) {
      successfulGets.add(1);
      successRate.add(1);
    } else {
      failedGets.add(1);
      successRate.add(0);
    }

  } catch (error) {
    console.error(`Test iteration failed: ${error.message}`);
    failedPurchases.add(1);
    successRate.add(0);
  }

  sleep(0.5); // Cool-down time
}
