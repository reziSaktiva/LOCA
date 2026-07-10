import type { Cart, CartItem } from "./cart-entities";

export type AddCartItemCommand = {
  cartId: string;
  variantId: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineSubtotal: number;
};

export type UpdateCartItemQuantityCommand = {
  itemId: string;
  quantity: number;
  lineSubtotal: number;
};

export type UpdateCartItemVariantCommand = {
  itemId: string;
  variantId: string;
  unitPriceSnapshot: number;
  lineSubtotal: number;
};

export interface CartRepository {
  // ---------------------------------------------------------------------------
  // Cart
  // ---------------------------------------------------------------------------
  findCartById(cartId: string): Promise<Cart | null>;
  findActiveCartByCustomerId(customerId: string): Promise<Cart | null>;
  createCart(customerId: string, currency: string): Promise<Cart>;

  // ---------------------------------------------------------------------------
  // CartItem
  // ---------------------------------------------------------------------------
  findCartItems(cartId: string): Promise<CartItem[]>;
  findCartItemById(itemId: string): Promise<CartItem | null>;
  findCartItemByVariantId(cartId: string, variantId: string): Promise<CartItem | null>;

  addItem(command: AddCartItemCommand): Promise<CartItem>;
  updateItemQuantity(command: UpdateCartItemQuantityCommand): Promise<CartItem>;
  updateItemVariant(command: UpdateCartItemVariantCommand): Promise<CartItem>;
  removeItem(itemId: string): Promise<void>;
  clearItems(cartId: string): Promise<void>;
}
