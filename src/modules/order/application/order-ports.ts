/** Catalog snapshot minimal untuk OrderItem immutable fields. */
export type OrderVariantSnapshot = {
  variantId: string;
  sku: string;
  productName: string;
  variantLabel: string;
  thumbnailUrl: string;
  brand: string;
  categoryName: string;
  status: "ACTIVE" | "INACTIVE";
};

export type OrderCatalogPort = {
  getVariantSnapshot(variantId: string): Promise<OrderVariantSnapshot | null>;
};

export type OrderReserveStockItem = {
  variantId: string;
  qty: number;
};

export type OrderInventoryPort = {
  reserveStock(input: {
    orderId: string;
    items: OrderReserveStockItem[];
    actorId: string;
  }): Promise<{ success: true } | { success: false; code: string; message: string }>;

  releaseReservedStock(input: {
    orderId: string;
    actorId: string;
  }): Promise<{ success: true } | { success: false; code: string; message: string }>;
};
