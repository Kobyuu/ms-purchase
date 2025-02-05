export interface IPurchase {
    product_id: number
    mailing_address: string
    purchase_date?: Date
  }
  
  export interface IProductResponse {
    data: {
      id: number
      [key: string]: any
    }
  }