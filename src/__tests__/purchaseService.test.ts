import { PurchaseService } from '../services/purchaseService';
import Purchase from '../models/Purchase.model';
import ProductService from '../services/productService';
import { cacheService } from '../services/redisCacheService';
import db from '../config/db';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

// Mock Sequelize and dbService
jest.mock('../config/db', () => {
    const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
    };

    return {
        __esModule: true,
        dbService: {
        transaction: jest.fn().mockResolvedValue(mockTransaction)
        },
        default: {
        transaction: jest.fn().mockResolvedValue(mockTransaction),
        addHook: jest.fn(),
        authenticate: jest.fn(),
        },
    };
})

// Mocks
jest.mock('../models/Purchase.model');
jest.mock('../services/productService');
jest.mock('../services/redisCacheService');

describe('PurchaseService', () => {
  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (db.transaction as jest.Mock).mockResolvedValue(mockTransaction);
  });

  describe('getAllPurchases', () => {
    it('should return all purchases', async () => {
      const mockPurchases = [
        { id: 1, product_id: 1, mailing_address: 'Address 1' },
        { id: 2, product_id: 2, mailing_address: 'Address 2' }
      ];
      (Purchase.findAll as jest.Mock).mockResolvedValue(mockPurchases);

      const result = await PurchaseService.getAllPurchases();

      expect(result).toEqual(mockPurchases);
      expect(Purchase.findAll).toHaveBeenCalled();
    });
  });

  describe('createPurchase', () => {
    const mockPurchaseData = {
      product_id: 1,
      mailing_address: 'Test Address'
    };

    const mockProduct = {
      data: { id: 1, name: 'Test Product' },
      statusCode: HTTP.OK
    };

    it('should create a purchase successfully', async () => {
      const mockCreatedPurchase = { 
        id: 1, 
        ...mockPurchaseData,
        purchase_date: expect.any(Date)
      };

      (ProductService.getProductById as jest.Mock).mockResolvedValue(mockProduct);
      (Purchase.create as jest.Mock).mockResolvedValue(mockCreatedPurchase);

      const result = await PurchaseService.createPurchase(mockPurchaseData);

      expect(result).toEqual(mockCreatedPurchase);
      expect(ProductService.getProductById).toHaveBeenCalledWith(mockPurchaseData.product_id);
      expect(Purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockPurchaseData,
          purchase_date: expect.any(Date)
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith([`product:${mockPurchaseData.product_id}`]);
    });

    it('should throw error if product_id is invalid', async () => {
      const invalidData = { ...mockPurchaseData, product_id: NaN };

      await expect(PurchaseService.createPurchase(invalidData))
        .rejects.toThrow(ERROR_MESSAGES.INVALID_PRODUCT_ID);
    });

    it('should throw error if product is not found', async () => {
      (ProductService.getProductById as jest.Mock).mockResolvedValue({
        statusCode: HTTP.NOT_FOUND,
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND
      });

      await expect(PurchaseService.createPurchase(mockPurchaseData))
        .rejects.toThrow(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('deletePurchase', () => {
    const mockPurchase = {
      id: 1,
      product_id: 1,
      destroy: jest.fn()
    };

    it('should delete a purchase successfully', async () => {
      (Purchase.findByPk as jest.Mock).mockResolvedValue(mockPurchase);
      mockPurchase.destroy.mockResolvedValue(true);

      const result = await PurchaseService.deletePurchase(1);

      expect(result).toBe(true);
      expect(Purchase.findByPk).toHaveBeenCalledWith(1);
      expect(mockPurchase.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith([`product:${mockPurchase.product_id}`]);
    });

    it('should throw error if purchase id is invalid', async () => {
      await expect(PurchaseService.deletePurchase(NaN))
        .rejects.toThrow(ERROR_MESSAGES.INVALID_PURCHASE_ID);
    });

    it('should throw error if purchase is not found', async () => {
      (Purchase.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(PurchaseService.deletePurchase(1))
        .rejects.toThrow(ERROR_MESSAGES.PURCHASE_NOT_FOUND);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      (Purchase.findByPk as jest.Mock).mockResolvedValue(mockPurchase);
      mockPurchase.destroy.mockRejectedValue(new Error('DB Error'));

      await expect(PurchaseService.deletePurchase(1))
        .rejects.toThrow('DB Error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});