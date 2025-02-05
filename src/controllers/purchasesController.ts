import { Request, Response } from 'express';
import { PurchaseService } from '../services/purchaseService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants/messages';
import { HTTP } from '../config/constants/httpStatus';

export class PurchaseController {
  static async getPurchases(_req: Request, res: Response): Promise<Response> {
    try {
      const purchases = await PurchaseService.getAllPurchases();
      return res.status(HTTP.OK).json(purchases);
    } catch (error) {
      return res.status(HTTP.SERVER_ERROR).json({ 
        message: ERROR_MESSAGES.GET_PURCHASES_ERROR 
      });
    }
  }

  static async createPurchase(req: Request, res: Response): Promise<Response> {
    try {
      const purchase = await PurchaseService.createPurchase(req.body);
      return res.status(HTTP.CREATED).json({ 
        message: SUCCESS_MESSAGES.PURCHASE_CREATED, 
        purchase 
      });
    } catch (error) {
      if (error.message === ERROR_MESSAGES.PRODUCT_NOT_FOUND) {
        return res.status(HTTP.NOT_FOUND).json({ 
          error: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
        });
      }
      return res.status(HTTP.SERVER_ERROR).json({ 
        error: ERROR_MESSAGES.CREATE_ERROR 
      });
    }
  }
}