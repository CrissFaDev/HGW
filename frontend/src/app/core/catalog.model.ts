export interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean | number;
  position: number;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string | null;
  sku: string | null;
  careInstructions: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  imagePublicId?: string | null;
  isActive: boolean | number;
  position: number;
  discountId?: number | null;
  discountTitle?: string | null;
  discountPercentage?: number | null;
  discountPrice?: number | null;
}

export interface Discount {
  id: number;
  productId: number;
  productName: string;
  title: string;
  percentage: number;
  startsAt: string | null;
  endsAt: string | null;
  finalPrice: number;
  isActive: boolean | number;
}

export interface ProductPayload {
  categoryId: number;
  name: string;
  description: string | null;
  sku: string | null;
  careInstructions: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  position: number;
}

export interface DiscountPayload {
  productId: number;
  title: string;
  percentage: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}
