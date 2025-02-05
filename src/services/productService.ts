import { axiosInstance } from '../config/axiosClient';
import { IProductResponse } from '../types/purchase.types';

export class ProductService {
  static async getProduct(productId: number): Promise<IProductResponse> {
    try {
      const url = `${process.env.PRODUCT_SERVICE_URL}/${productId}`;
      console.log('Requesting product from:', url);
      const response = await axiosInstance.get<IProductResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error.message);
      throw error;
    }
  }
}