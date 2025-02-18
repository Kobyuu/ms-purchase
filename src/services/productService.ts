import { IProduct, IProductResponse } from '../types/purchase.types';
import axiosClient from '../config/axiosClient';
import { ENV } from '../config/constants/environment';
import { HTTP, ERROR_MESSAGES } from '../config/constants';
import { CACHE_KEYS } from '../config/constants';
import { LOG_MESSAGES } from '../config/constants/messages';
import { cacheService } from './redisCacheService';
import { ProductValidationMiddleware } from '../middleware/productValidation';

class ProductService {
  async getProductById(productId: number): Promise<IProductResponse> {
    const cacheKey = `${CACHE_KEYS.PRODUCT}:${productId}`;
    try {
      const cachedProduct = await cacheService.getFromCache(cacheKey);
      if (cachedProduct) {
        if (!this.isValidProduct(cachedProduct)) {
          return ProductValidationMiddleware.createErrorResponse(
            ERROR_MESSAGES.INVALID_DATA,
            HTTP.BAD_REQUEST
          );
        }
        return ProductValidationMiddleware.createSuccessResponse(cachedProduct as IProduct);
      }

      const productResponse = await axiosClient.get(`${ENV.PRODUCT_SERVICE_URL}/${productId}`);
      
      if (!productResponse.data || !productResponse.data.data) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PRODUCT_NOT_FOUND,
          HTTP.NOT_FOUND
        );
      }

      const product: IProduct = {
        productId: productResponse.data.data.productId || productResponse.data.data.id,
        name: productResponse.data.data.name,
        price: productResponse.data.data.price,
        activate: productResponse.data.data.activate
      };

      if (!this.isValidProduct(product)) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.INVALID_DATA,
          HTTP.BAD_REQUEST
        );
      }

      await cacheService.setToCache(cacheKey, product);
      return ProductValidationMiddleware.createSuccessResponse(product);

    } catch (error: any) {
      console.error(LOG_MESSAGES.SERVICE_ERROR, error);
      if (error.response?.status === HTTP.NOT_FOUND) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
          HTTP.NOT_FOUND
        );
      }
      console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
      return ProductValidationMiddleware.createErrorResponse(
        ERROR_MESSAGES.HTTP_REQUEST, 
        HTTP.SERVER_ERROR
      );
    }
  }

  private isValidProduct(product: any): product is IProduct {
    return (
      product &&
      typeof product.productId === 'number' &&
      typeof product.name === 'string' &&
      typeof product.price === 'number' &&
      typeof product.activate === 'boolean'
    );
  }
}

export default new ProductService();