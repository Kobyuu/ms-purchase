import axios from 'axios';
import { ENV } from '../config/constants';
import { withRetries } from '../utils/retry.util';
import { IProductResponse } from '../types/purchase.types';

export class ProductService {
  static async getProduct(productId: number): Promise<IProductResponse> {
    const url = `${process.env.PRODUCT_SERVICE_URL}/${productId}`;
    return await withRetries(async () => {
      const response = await axios.get<IProductResponse>(url);
      return response.data;
    }, ENV.RETRY_LIMIT);
  }
}