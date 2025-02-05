import { ProductService } from './productService';
import Purchase from '../models/Purchase.model';
import { IPurchase } from '../types/purchase.types';
import db from '../config/db';
import { ERROR_MESSAGES } from '../config/constants';

export class PurchaseService {
  static async getAllPurchases() {
    return await Purchase.findAll();
  }

  static async createPurchase(purchaseData: IPurchase) {
    const transaction = await db.transaction();
    
    try {
      const product = await ProductService.getProduct(purchaseData.product_id);

      if (!product) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }

      const purchase = await Purchase.create({
        ...purchaseData,
        purchase_date: new Date()
      }, { transaction });

      await transaction.commit();
      return purchase;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}