import ProductService from './productService';
import Purchase from '../models/Purchase.model';
import { IPurchase } from '../types/purchase.types';
import db from '../config/db';
import { ERROR_MESSAGES, HTTP } from '../config/constants';
import { CACHE_KEYS } from '../config/constants';
import { LOG_MESSAGES } from '../config/constants/messages';
import { cacheService } from './redisCacheService';

// Servicio para gestionar las compras
export class PurchaseService {
  // Obtiene todas las compras
  static async getAllPurchases() {
    return await Purchase.findAll();
  }

  // Crea una nueva compra y maneja la transacción
  static async createPurchase(purchaseData: IPurchase) {
    let transaction;
    
    try {
        // Valida ID del producto antes de iniciar la transacción
        if (!purchaseData.product_id || isNaN(purchaseData.product_id)) {
            throw new Error(ERROR_MESSAGES.INVALID_PRODUCT_ID);
        }

        // Verifica existencia del producto antes de iniciar la transacción
        const productResponse = await ProductService.getProductById(purchaseData.product_id);

        // Verifica la respuesta del servicio de productos
        if (!productResponse || productResponse.statusCode !== HTTP.OK || !productResponse.data) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        // Inicia la transacción después de validar
        transaction = await db.transaction();

        // Crea el registro de compra asegurándose que product_id es un número
        const purchase = await Purchase.create({
            product_id: Number(purchaseData.product_id),
            mailing_address: purchaseData.mailing_address,
            purchase_date: new Date()
        }, { transaction });

        await transaction.commit();
        
        const cacheKey = CACHE_KEYS.PRODUCT.BY_ID(purchaseData.product_id);
        await cacheService.clearCache([cacheKey]);
        
        return purchase;
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        throw new Error(error.message || ERROR_MESSAGES.CREATE_ERROR);
    }
  }

  // Elimina una compra por ID
  static async deletePurchase(purchaseId: number) {
    let transaction;
    
    try {
        if (!purchaseId || isNaN(purchaseId)) {
            throw new Error(ERROR_MESSAGES.INVALID_PURCHASE_ID);
        }

        // Primero verifica si existe la compra antes de iniciar la transacción
        const purchase = await Purchase.findByPk(purchaseId);
        
        if (!purchase) {
            throw new Error(ERROR_MESSAGES.PURCHASE_NOT_FOUND);
        }

        // Inicia la transacción solo si la compra existe
        transaction = await db.transaction();

        // Elimina la compra
        await purchase.destroy({ transaction });
        
        // Confirma la transacción
        await transaction.commit();
        
        // Limpia caché del producto
        const cacheKey = CACHE_KEYS.PRODUCT.BY_ID(purchase.product_id);
        await cacheService.clearCache([cacheKey]);
        console.log(ERROR_MESSAGES.CACHE_CLEARED, cacheKey);
        
        return true;
    } catch (error) {
        // Solo intenta hacer rollback si la transacción existe
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error(LOG_MESSAGES.ROLLBACK_ERROR, rollbackError);
            }
        }
        throw new Error(error.message || ERROR_MESSAGES.DELETE_PURCHASE_ERROR);
    }
  }
}