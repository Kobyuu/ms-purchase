import { ProductService } from './productService';
import Purchase from '../models/Purchase.model';
import { IPurchase } from '../types/purchase.types';
import db from '../config/db';
import { ERROR_MESSAGES } from '../config/constants';
import { redis } from '../config/redisClient';

// Obtener todas las compras
export class PurchaseService {
  static async getAllPurchases() {
    return await Purchase.findAll();
  }
// Crear una compra
  static async createPurchase(purchaseData: IPurchase) {
    const transaction = await db.transaction();
    
    try {
      // Verificar que el producto existe
      console.log('Fetching product:', purchaseData.product_id);
      const product = await ProductService.getProduct(purchaseData.product_id);

      if (!product) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }

      // Crear la compra sin importar si ya existen otras del mismo producto
      console.log('Creating purchase with data:', purchaseData);
      const purchase = await Purchase.create({
        ...purchaseData,
        purchase_date: new Date()
      }, { transaction });

      await transaction.commit();
      
      // Invalidar cache
      await redis.del(`cache:${process.env.PRODUCT_SERVICE_URL}/${purchaseData.product_id}`);
      
      return purchase;
    } catch (error) {
      console.error('Error in createPurchase:', error);
      await transaction.rollback();
      throw error;
    }
  }
// Eliminar una compra
  static async deletePurchase(purchaseId: number) {
    const transaction = await db.transaction();
  
    try {
      const purchase = await Purchase.findByPk(purchaseId);
  
      if (!purchase) {
        throw new Error(ERROR_MESSAGES.PURCHASE_NOT_FOUND);
      }
  
      await purchase.destroy({ transaction });
  
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}