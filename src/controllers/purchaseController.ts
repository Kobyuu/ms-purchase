import { Request, Response } from 'express';
import { PurchaseService } from '../services/purchaseService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants/messages';
import { HTTP } from '../config/constants/httpStatus';

export class PurchaseController {
  // Obtener todas las compras
  static async getPurchases(_req: Request, res: Response): Promise<Response> {
    try {
      const purchases = await PurchaseService.getAllPurchases();
      return res.status(HTTP.OK).json({
        success: true,
        data: purchases,
        message: SUCCESS_MESSAGES.GET_PURCHASES
      });
    } catch (error) {
      return res.status(HTTP.SERVER_ERROR).json({ 
        success: false,
        message: ERROR_MESSAGES.GET_PURCHASES_ERROR 
      });
    }
  }
  // Eliminar una compra
  static async deletePurchase(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await PurchaseService.deletePurchase(Number(id));
      return res.status(HTTP.OK).json({ 
        success: true, 
        message: SUCCESS_MESSAGES.PURCHASE_DELETED 
      });
    } catch (error) {
      return res.status(HTTP.SERVER_ERROR).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
  // Crear una compra
  static async createPurchase(req: Request, res: Response): Promise<Response> {
    try {
        const purchase = await PurchaseService.createPurchase(req.body);
        return res.status(HTTP.CREATED).json({ 
            success: true,
            message: SUCCESS_MESSAGES.PURCHASE_CREATED, 
            data: purchase 
        });
    } catch (error) {
        console.error(ERROR_MESSAGES.CREATE_ERROR, error);
        if (error.message === ERROR_MESSAGES.PRODUCT_NOT_FOUND) {
            return res.status(HTTP.NOT_FOUND).json({ 
                success: false,
                error: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
            });
        }
        return res.status(HTTP.SERVER_ERROR).json({ 
            success: false,
            error: error.message || ERROR_MESSAGES.CREATE_ERROR 
        });
    }
  }
}