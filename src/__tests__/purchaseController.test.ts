import { Request, Response } from 'express';
import { PurchaseController } from '../controllers/purchaseController';
import { PurchaseService } from '../services/purchaseService';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

jest.mock('../services/purchaseService');

describe('PurchaseController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnThis();
    mockResponse = {
      json: jsonSpy,
      status: statusSpy,
    };
    mockRequest = {};
  });

  describe('getPurchases', () => {
    it('should return all purchases successfully', async () => {
      const mockPurchases = [
        { id: 1, product_id: 1, mailing_address: 'Test Address 1' },
        { id: 2, product_id: 2, mailing_address: 'Test Address 2' }
      ];

      (PurchaseService.getAllPurchases as jest.Mock).mockResolvedValue(mockPurchases);

      await PurchaseController.getPurchases(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(HTTP.OK);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: mockPurchases,
        message: SUCCESS_MESSAGES.GET_PURCHASES
      });
    });

    it('should handle errors when getting purchases', async () => {
      (PurchaseService.getAllPurchases as jest.Mock).mockRejectedValue(new Error());

      await PurchaseController.getPurchases(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(HTTP.SERVER_ERROR);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.GET_PURCHASES_ERROR
      });
    });
  });

  describe('createPurchase', () => {
    const mockPurchaseData = {
      product_id: 1,
      mailing_address: 'Test Address'
    };

    it('should create a purchase successfully', async () => {
      const mockCreatedPurchase = { 
        id: 1,
        ...mockPurchaseData,
        purchase_date: new Date()
      };

      mockRequest.body = mockPurchaseData;
      (PurchaseService.createPurchase as jest.Mock).mockResolvedValue(mockCreatedPurchase);

      await PurchaseController.createPurchase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(HTTP.CREATED);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.PURCHASE_CREATED,
        purchase: mockCreatedPurchase
      });
    });

    it('should handle product not found error', async () => {
      mockRequest.body = mockPurchaseData;
      const error = new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      (PurchaseService.createPurchase as jest.Mock).mockRejectedValue(error);

      await PurchaseController.createPurchase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(jsonSpy).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND
      });
    });
  });

  describe('deletePurchase', () => {
    it('should delete a purchase successfully', async () => {
      mockRequest.params = { id: '1' };
      (PurchaseService.deletePurchase as jest.Mock).mockResolvedValue(true);

      await PurchaseController.deletePurchase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(HTTP.OK);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: SUCCESS_MESSAGES.PURCHASE_DELETED
      });
    });

    it('should handle errors when deleting purchase', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error(ERROR_MESSAGES.PURCHASE_NOT_FOUND);
      (PurchaseService.deletePurchase as jest.Mock).mockRejectedValue(error);

      await PurchaseController.deletePurchase(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusSpy).toHaveBeenCalledWith(HTTP.SERVER_ERROR);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: ERROR_MESSAGES.PURCHASE_NOT_FOUND
      });
    });
  });
});