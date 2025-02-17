import { IProduct, IProductResponse } from '../types/purchase.types';
import { HTTP, ERROR_MESSAGES } from '../config/constants';

// Middleware para validación de productos
export class ProductValidationMiddleware {
  // Crea respuesta para casos de error
  static createErrorResponse(error: string, statusCode: number): IProductResponse {
    return {
      data: {} as IProduct,
      error,
      statusCode
    };
  }

  // Crea respuesta para casos exitosos  
  static createSuccessResponse(data: IProduct): IProductResponse {
    return {
      data,
      statusCode: HTTP.OK
    };
  }

  // Valida existencia del producto
  static validateProduct(product: IProduct | null): IProductResponse {
    if (!product) {
      return this.createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP.NOT_FOUND);
    }
    return this.createSuccessResponse(product);
  }
}