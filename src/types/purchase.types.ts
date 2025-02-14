export interface IPurchase {
    product_id: number
    mailing_address: string
    purchase_date?: Date
  }
  
// Product interfaces
export interface IProduct {
  productId: number; 
  name: string;
  price: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductResponse {
  data: IProduct;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface CacheService {
  getFromCache(key: string): Promise<any>;
  setToCache(key: string, data: any): Promise<void>;
  clearCache(keys: string[]): Promise<void>;
}