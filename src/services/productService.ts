import { IProduct, IProductResponse } from '../types/purchase.types';
import axiosClient from '../config/axiosClient';
import { ENV } from '../config/constants/environment';
import { HTTP, ERROR_MESSAGES } from '../config/constants';
import { cacheService } from './redisCacheService';
import { ProductValidationMiddleware } from '../middleware/productValidation';

// Servicio para gestionar productos y su caché
class ProductService {
  // Obtiene un producto por ID desde caché o servicio externo
  async getProductById(productId: number): Promise<IProductResponse> {
    const cacheKey = `product:${productId}`;
    try {
      // Intenta obtener producto desde caché
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

      // Obtiene producto desde servicio externo
      const productResponse = await axiosClient.get(`${ENV.PRODUCT_SERVICE_URL}/${productId}`);
      
      // Verifica si hay datos y si tienen la estructura esperada
      if (!productResponse.data || !productResponse.data.data) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PRODUCT_NOT_FOUND,
          HTTP.NOT_FOUND
        );
      }

      // Mapea respuesta a modelo de producto
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

      // Guarda en caché y retorna producto
      await cacheService.setToCache(cacheKey, product);
      return ProductValidationMiddleware.createSuccessResponse(product);

    } catch (error: any) {
      console.error('Service Error:', error);
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

  // Valida que el objeto cumpla con la interfaz IProduct
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