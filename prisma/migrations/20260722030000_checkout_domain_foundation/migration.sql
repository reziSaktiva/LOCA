-- CreateEnum
CREATE TYPE "CheckoutStatus" AS ENUM (
  'STARTED',
  'ADDRESS_CONFIRMED',
  'SHIPPING_SELECTED',
  'PAYMENT_METHOD_SELECTED',
  'ORDER_PLACED'
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "checkoutStatus" "CheckoutStatus" NOT NULL DEFAULT 'STARTED',
    "selectedAddressId" TEXT,
    "selectedShippingOptionId" TEXT,
    "selectedShippingServiceName" TEXT,
    "selectedShippingFee" DOUBLE PRECISION,
    "selectedPaymentMethod" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "itemsSubtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderId" TEXT,
    "snapshotJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checkout_sessions_customerId_checkoutStatus_idx" ON "checkout_sessions"("customerId", "checkoutStatus");

-- CreateIndex
CREATE INDEX "checkout_sessions_cartId_idx" ON "checkout_sessions"("cartId");
