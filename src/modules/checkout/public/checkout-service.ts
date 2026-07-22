/**
 * Checkout Public Service / Facade
 *
 * Entry point untuk consumer lintas module (API layer, order).
 * Semua akses ke Checkout harus melalui fungsi di file ini.
 *
 * Decision 027: shipping/payment memakai stub ports hingga Phase 6.
 * M7.2: CheckoutOrderPort di-wire ke order public facade.
 */

import { cartClear, getCartSnapshotForCheckout } from "../../cart/public/cart-service";
import { customerListAddresses } from "../../customer/public/customer-service";
import { createOrderFromCheckout } from "../../order/public/order-service";
import type {
  CheckoutCartPort,
  CheckoutCustomerPort,
  CheckoutOrderPort,
} from "../application/checkout-ports";
import {
  getShippingOptionsForCheckout,
  selectCheckoutAddress,
  selectCheckoutPaymentMethod,
  selectCheckoutShippingOption,
} from "../application/manage-checkout-selection";
import { placeOrder, type PlaceOrderResult } from "../application/place-order";
import { prepareCheckout, type PrepareCheckoutView } from "../application/prepare-checkout";
import { createStubPaymentMethodPort } from "../application/stub-payment-method-port";
import { createStubShippingPort } from "../application/stub-shipping-port";
import type {
  CheckoutResult,
  CheckoutSession,
  PaymentMethodOption,
  ShippingOption,
} from "../domain/checkout-entities";
import { PrismaCheckoutRepository } from "../infrastructure/prisma-checkout-repository";

export type {
  CheckoutError,
  CheckoutResult,
  CheckoutSession,
  CheckoutSnapshot,
  CheckoutStatus,
  PaymentMethodOption,
  ShippingOption,
} from "../domain/checkout-entities";

export type { PrepareCheckoutView } from "../application/prepare-checkout";
export type { PlaceOrderResult } from "../application/place-order";

const repository = new PrismaCheckoutRepository();
const shippingPort = createStubShippingPort();
const paymentPort = createStubPaymentMethodPort();

function makeOrderPort(): CheckoutOrderPort {
  return {
    async createOrderFromCheckout(snapshot) {
      const result = await createOrderFromCheckout(snapshot);
      if (!result.success) {
        return {
          success: false,
          code: "ORDER_CREATE_FAILED",
          message: result.error.message,
        };
      }
      return { success: true, orderId: result.data.id };
    },
  };
}

const orderPort = makeOrderPort();

function makeCartPort(): CheckoutCartPort {
  return {
    async getSnapshot(customerId) {
      const snapshot = await getCartSnapshotForCheckout(customerId);
      return {
        cartId: snapshot.cart.id,
        currency: snapshot.cart.currency,
        itemCount: snapshot.items.length,
        itemsSubtotal: snapshot.subtotal,
        items: snapshot.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPriceSnapshot: item.unitPriceSnapshot,
          lineSubtotal: item.lineSubtotal,
        })),
      };
    },
    async clearAfterCheckout(customerId) {
      const result = await cartClear(customerId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
    },
  };
}

function makeCustomerPort(): CheckoutCustomerPort {
  return {
    async listAddresses(customerId) {
      const addresses = await customerListAddresses(customerId);
      return addresses.map((address) => ({
        id: address.id,
        customerId: address.customerId,
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        district: address.district,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      }));
    },
  };
}

/** Menyiapkan sesi checkout + opsi shipping/payment stub. */
export async function checkoutPrepare(
  customerId: string,
): Promise<CheckoutResult<PrepareCheckoutView>> {
  return prepareCheckout(
    repository,
    makeCartPort(),
    makeCustomerPort(),
    shippingPort,
    paymentPort,
    customerId,
  );
}

/** Facade name selaras docs/05 — prepareCheckout. */
export async function prepareCheckoutForCustomer(
  customerId: string,
): Promise<CheckoutResult<PrepareCheckoutView>> {
  return checkoutPrepare(customerId);
}

export async function checkoutSelectAddress(
  customerId: string,
  addressId: string,
): Promise<CheckoutResult<CheckoutSession>> {
  return selectCheckoutAddress(repository, makeCustomerPort(), { customerId, addressId });
}

export async function checkoutGetShippingOptions(
  customerId: string,
): Promise<CheckoutResult<{ options: ShippingOption[] }>> {
  return getShippingOptionsForCheckout(
    repository,
    makeCustomerPort(),
    shippingPort,
    customerId,
  );
}

/** Facade name selaras docs/05 — getShippingOptions. */
export async function getShippingOptionsForCustomer(
  customerId: string,
): Promise<CheckoutResult<{ options: ShippingOption[] }>> {
  return checkoutGetShippingOptions(customerId);
}

export async function checkoutSelectShippingOption(
  customerId: string,
  optionId: string,
): Promise<CheckoutResult<CheckoutSession>> {
  return selectCheckoutShippingOption(repository, makeCustomerPort(), shippingPort, {
    customerId,
    optionId,
  });
}

export async function checkoutSelectPaymentMethod(
  customerId: string,
  method: string,
): Promise<CheckoutResult<CheckoutSession>> {
  return selectCheckoutPaymentMethod(repository, paymentPort, { customerId, method });
}

export async function checkoutListPaymentMethods(): Promise<PaymentMethodOption[]> {
  return paymentPort.listMethods();
}

/**
 * Place order — membuat order WAITING_PAYMENT via order facade + reserve stock.
 */
export async function checkoutPlaceOrder(
  customerId: string,
): Promise<CheckoutResult<PlaceOrderResult>> {
  return placeOrder(
    repository,
    makeCartPort(),
    makeCustomerPort(),
    shippingPort,
    paymentPort,
    orderPort,
    { customerId },
  );
}

/** Facade name selaras docs/05 — placeOrder. */
export async function placeOrderForCustomer(
  customerId: string,
): Promise<CheckoutResult<PlaceOrderResult>> {
  return checkoutPlaceOrder(customerId);
}
