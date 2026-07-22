import type {
  CheckoutPaymentSnapshot,
  CheckoutResult,
  CheckoutSnapshot,
  CheckoutShippingSnapshot,
  PlaceOrderCommand,
} from "../domain/checkout-entities";
import { isReadyToPlaceOrder } from "../domain/checkout-invariants";
import type { CheckoutRepository } from "../domain/checkout-repository";
import type {
  CheckoutCartPort,
  CheckoutCustomerPort,
  CheckoutOrderPort,
  CheckoutPaymentMethodPort,
  CheckoutShippingPort,
} from "./checkout-ports";

export type PlaceOrderResult = {
  orderId: string;
  snapshot: CheckoutSnapshot;
};

/**
 * Membangun CheckoutSnapshot immutable lalu membuat order via CheckoutOrderPort.
 * Cart dikosongkan hanya setelah order berhasil dibuat.
 */
export async function placeOrder(
  repository: CheckoutRepository,
  cartPort: CheckoutCartPort,
  customerPort: CheckoutCustomerPort,
  shippingPort: CheckoutShippingPort,
  paymentPort: CheckoutPaymentMethodPort,
  orderPort: CheckoutOrderPort,
  command: PlaceOrderCommand,
): Promise<CheckoutResult<PlaceOrderResult>> {
  const session = await repository.findOpenByCustomerId(command.customerId);
  if (!session) {
    return {
      success: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "No open checkout session. Call prepareCheckout first.",
      },
    };
  }

  if (!isReadyToPlaceOrder(session)) {
    return {
      success: false,
      error: {
        code: "CHECKOUT_INCOMPLETE",
        message: "Address, shipping option, and payment method are required before placing an order.",
      },
    };
  }

  const cart = await cartPort.getSnapshot(command.customerId);
  if (cart.itemCount < 1 || cart.cartId !== session.cartId) {
    return {
      success: false,
      error: {
        code: "CART_EMPTY",
        message: "Cart is empty or no longer matches this checkout session.",
      },
    };
  }

  const addresses = await customerPort.listAddresses(command.customerId);
  const address = addresses.find((a) => a.id === session.selectedAddressId);
  if (!address) {
    return {
      success: false,
      error: {
        code: "ADDRESS_NOT_FOUND",
        message: "Selected address was not found for this customer.",
      },
    };
  }

  const shippingOptions = await shippingPort.listOptions({
    customerId: command.customerId,
    cartId: session.cartId,
    destinationPostalCode: address.postalCode,
  });
  const shippingOption = shippingOptions.find(
    (o) => o.optionId === session.selectedShippingOptionId,
  );
  if (!shippingOption) {
    return {
      success: false,
      error: {
        code: "SHIPPING_OPTION_INVALID",
        message: "Selected shipping option is no longer available.",
      },
    };
  }

  const paymentMethods = await paymentPort.listMethods();
  const paymentMethod = paymentMethods.find((m) => m.method === session.selectedPaymentMethod);
  if (!paymentMethod) {
    return {
      success: false,
      error: {
        code: "PAYMENT_METHOD_INVALID",
        message: "Selected payment method is no longer available.",
      },
    };
  }

  const shippingSnapshot: CheckoutShippingSnapshot = {
    optionId: shippingOption.optionId,
    provider: shippingOption.provider,
    serviceCode: shippingOption.serviceCode,
    serviceName: shippingOption.serviceName,
    estimatedDays: shippingOption.estimatedDays,
    shippingFee: shippingOption.shippingFee,
  };

  const paymentSnapshot: CheckoutPaymentSnapshot = {
    method: paymentMethod.method,
    label: paymentMethod.label,
  };

  const snapshot: CheckoutSnapshot = {
    sessionId: session.id,
    customerId: session.customerId,
    cartId: session.cartId,
    currency: session.currency,
    items: cart.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPriceSnapshot: item.unitPriceSnapshot,
      lineSubtotal: item.lineSubtotal,
    })),
    itemsSubtotal: cart.itemsSubtotal,
    shippingFee: shippingOption.shippingFee,
    grandTotal: cart.itemsSubtotal + shippingOption.shippingFee,
    address: {
      addressId: address.id,
      recipientName: address.recipientName,
      phone: address.phone,
      street: address.street,
      district: address.district,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
    },
    shipping: shippingSnapshot,
    payment: paymentSnapshot,
  };

  const orderResult = await orderPort.createOrderFromCheckout(snapshot);
  if (!orderResult.success) {
    return {
      success: false,
      error: {
        code: orderResult.code,
        message: orderResult.message,
      },
    };
  }

  await repository.update({
    sessionId: session.id,
    checkoutStatus: "ORDER_PLACED",
    orderId: orderResult.orderId,
    itemsSubtotal: snapshot.itemsSubtotal,
    shippingFee: snapshot.shippingFee,
    grandTotal: snapshot.grandTotal,
    snapshot,
  });

  await cartPort.clearAfterCheckout(command.customerId);

  return {
    success: true,
    data: { orderId: orderResult.orderId, snapshot },
  };
}
