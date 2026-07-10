-- Migration: 20260709160000_inventory_foundation
-- Module: Inventory
-- Entities: InventoryItem, InventoryReservation, InventoryMovement

-- Enums
CREATE TYPE "InventoryMovementType" AS ENUM (
  'STOCK_IN',
  'STOCK_OUT',
  'ADJUSTMENT',
  'RESERVE',
  'RELEASE',
  'COMMIT'
);

CREATE TYPE "ReservationStatus" AS ENUM (
  'ACTIVE',
  'COMMITTED',
  'RELEASED',
  'EXPIRED'
);

-- InventoryItem: stok per varian (aggregate root)
CREATE TABLE "inventory_items" (
  "id"            TEXT NOT NULL,
  "variantId"     TEXT NOT NULL,
  "onHandQty"     INTEGER NOT NULL DEFAULT 0,
  "reservedQty"   INTEGER NOT NULL DEFAULT 0,
  "availableQty"  INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy"     TEXT,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  "updatedBy"     TEXT,

  CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "inventory_items_variantId_key" ON "inventory_items"("variantId");
CREATE INDEX "inventory_items_variantId_idx" ON "inventory_items"("variantId");

-- InventoryReservation: reservasi stok per order item
CREATE TABLE "inventory_reservations" (
  "id"                  TEXT NOT NULL,
  "orderId"             TEXT NOT NULL,
  "variantId"           TEXT NOT NULL,
  "qty"                 INTEGER NOT NULL,
  "reservationStatus"   "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "expiresAt"           TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy"           TEXT,
  "updatedAt"           TIMESTAMP(3) NOT NULL,
  "updatedBy"           TEXT,

  CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inventory_reservations_orderId_idx" ON "inventory_reservations"("orderId");
CREATE INDEX "inventory_reservations_variantId_reservationStatus_idx" ON "inventory_reservations"("variantId", "reservationStatus");

ALTER TABLE "inventory_reservations"
  ADD CONSTRAINT "inventory_reservations_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "inventory_items"("variantId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- InventoryMovement: audit trail append-only
CREATE TABLE "inventory_movements" (
  "id"            TEXT NOT NULL,
  "variantId"     TEXT NOT NULL,
  "movementType"  "InventoryMovementType" NOT NULL,
  "qtyDelta"      INTEGER NOT NULL,
  "reason"        TEXT NOT NULL,
  "referenceType" TEXT,
  "referenceId"   TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy"     TEXT,

  CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inventory_movements_variantId_createdAt_idx" ON "inventory_movements"("variantId", "createdAt");

ALTER TABLE "inventory_movements"
  ADD CONSTRAINT "inventory_movements_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "inventory_items"("variantId")
  ON DELETE RESTRICT ON UPDATE CASCADE;
