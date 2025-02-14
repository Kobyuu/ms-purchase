import ProductService from './productService';
import Purchase from '../models/Purchase.model';
import { IPurchase } from '../types/purchase.types';
import db from '../config/db';
import { ERROR_MESSAGES, HTTP } from '../config/constants';
import { cacheService } from './redisCacheService';

export class PurchaseService {
  static async getAllPurchases() {
    return await Purchase.findAll();
  }

  static async createPurchase(purchaseData: IPurchase) {
    const transaction = await db.transaction();
    
    try {
      if (!purchaseData.product_id || isNaN(purchaseData.product_id)) {
        throw new Error(ERROR_MESSAGES.INVALID_PRODUCT_ID);
      }

      console.log(ERROR_MESSAGES.FETCHING_PRODUCT, purchaseData.product_id);
      const productResponse = await ProductService.getProductById(purchaseData.product_id);

      if (productResponse.statusCode !== HTTP.OK) {
        await transaction.rollback();
        throw new Error(productResponse.error || ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }

      console.log(ERROR_MESSAGES.CREATING_PURCHASE, purchaseData);
      const purchase = await Purchase.create({
        ...purchaseData,
        purchase_date: new Date()
      }, { transaction });

      await transaction.commit();
      
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

  static async deletePurchase(purchaseId: number) {
    if (!purchaseId || isNaN(purchaseId)) {
      throw new Error(ERROR_MESSAGES.INVALID_PURCHASE_ID);
    }

    const transaction = await db.transaction();
  
    try {
      const purchase = await Purchase.findByPk(purchaseId);
  
      if (!purchase) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PURCHASE_NOT_FOUND);
      }
  
      await purchase.destroy({ transaction });
      await transaction.commit();
      
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