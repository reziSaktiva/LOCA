// ---------------------------------------------------------------------------
// Cart Module — Port Contracts
// Cart bergantung pada Catalog (validasi variant) dan Inventory (validasi stok)
// sesuai matrix dependency di docs/05-domain-modules.md §3.
// Port didefinisikan di layer application agar domain tetap pure dan
// implementasi konkret (public facade module lain) tetap terpisah dari use case.
// ---------------------------------------------------------------------------

export type CartVariant = {
  variantId: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
};

export type CartCatalogPort = {
  getVariantSnapshot(variantId: string): Promise<CartVariant | null>;
};

export type StockAvailabilityCheck = { success: true } | { success: false; message: string };

export type CartInventoryPort = {
  assertStockAvailable(variantId: string, qty: number): Promise<StockAvailabilityCheck>;
};
