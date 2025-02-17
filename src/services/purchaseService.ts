import ProductService from './productService';
import Purchase from '../models/Purchase.model';
import { IPurchase } from '../types/purchase.types';
import db from '../config/db';
import { ERROR_MESSAGES, HTTP } from '../config/constants';
import { cacheService } from './redisCacheService';

// Servicio para gestionar las compras
export class PurchaseService {
  // Obtiene todas las compras
  static async getAllPurchases() {
    return await Purchase.findAll();
  }

  // Crea una nueva compra y maneja la transacción
  static async createPurchase(purchaseData: IPurchase) {
    const transaction = await db.transaction();
    
    try {
      // Valida ID del producto
      if (!purchaseData.product_id || isNaN(purchaseData.product_id)) {
        throw new Error(ERROR_MESSAGES.INVALID_PRODUCT_ID);
      }

      // Verifica existencia del producto
      console.log(ERROR_MESSAGES.FETCHING_PRODUCT, purchaseData.product_id);
      const productResponse = await ProductService.getProductById(purchaseData.product_id);

      if (productResponse.statusCode !== HTTP.OK) {
        await transaction.rollback();
        throw new Error(productResponse.error || ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }

      // Crea el registro de compra
      console.log(ERROR_MESSAGES.CREATING_PURCHASE, purchaseData);
      const purchase = await Purchase.create({
        ...purchaseData,
        purchase_date: new Date()
      }, { transaction });

      await transaction.commit();
      
      // Limpia caché del producto
      const cacheKey = `product:${purchaseData.product_id}`;
      await cacheService.clearCache([cacheKey]);
      console.log(ERROR_MESSAGES.CACHE_CLEARED, cacheKey);
      
      return purchase;
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_PURCHASE_ERROR, error);
      await transaction.rollback();
      throw error;
    }
  }

  // Elimina una compra por ID
  static async deletePurchase(purchaseId: number) {
    if (!purchaseId || isNaN(purchaseId)) {
      throw new Error(ERROR_MESSAGES.INVALID_PURCHASE_ID);
    }

    const transaction = await db.transaction();
  
    try {
      // Busca la compra a eliminar
      const purchase = await Purchase.findByPk(purchaseId);
  
      if (!purchase) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PURCHASE_NOT_FOUND);
      }
  
      // Elimina la compra y confirma transacción
      await purchase.destroy({ transaction });
      await transaction.commit();
      
      // Limpia caché del producto
      const cacheKey = `product:${purchase.product_id}`;
      await cacheService.clearCache([cacheKey]);
      console.log(ERROR_MESSAGES.CACHE_CLEARED, cacheKey);
      
      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_PURCHASE_ERROR, error);
      await transaction.rollback();
      throw error;
    }
  }
}