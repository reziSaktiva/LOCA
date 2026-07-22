import type {
  CheckoutResult,
  CheckoutSession,
  PaymentMethodOption,
  ShippingOption,
} from "../domain/checkout-entities";
import {
  calculateGrandTotal,
  isCartNonEmpty,
  isCheckoutEditable,
} from "../domain/checkout-invariants";
import type { CheckoutRepository } from "../domain/checkout-repository";
import type {
  CheckoutCartPort,
  CheckoutCustomerPort,
  CheckoutPaymentMethodPort,
  CheckoutShippingPort,
} from "./checkout-ports";

export type PrepareCheckoutView = {
  session: CheckoutSession;
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethodOption[];
};

/**
 * Menyiapkan / menyegarkan sesi checkout dari cart aktif + alamat customer.
 * Auto-confirm alamat default bila ada.
 */
export async function prepareCheckout(
  repository: CheckoutRepository,
  cartPort: CheckoutCartPort,
  customerPort: CheckoutCustomerPort,
  shippingPort: CheckoutShippingPort,
  paymentPort: CheckoutPaymentMethodPort,
  customerId: string,
): Promise<CheckoutResult<PrepareCheckoutView>> {
  const cart = await cartPort.getSnapshot(customerId);
  if (!isCartNonEmpty(cart.itemCount)) {
    return {
      success: false,
      error: { code: "CART_EMPTY", message: "Cart must contain at least one item before checkout." },
    };
  }

  const addresses = await customerPort.listAddresses(customerId);
  if (addresses.length === 0) {
    return {
      success: false,
      error: {
        code: "ADDRESS_REQUIRED",
        message: "Customer must have at least one shipping address before checkout.",
      },
    };
  }

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0]!;
  const paymentMethods = await paymentPort.listMethods();

  let session = await repository.findOpenByCustomerId(customerId);

  if (!session) {
    session = await repository.create({
      customerId,
      cartId: cart.cartId,
      currency: cart.currency,
      itemsSubtotal: cart.itemsSubtotal,
      selectedAddressId: defaultAddress.id,
      checkoutStatus: "ADDRESS_CONFIRMED",
    });
  } else if (!isCheckoutEditable(session.checkoutStatus)) {
    return {
      success: false,
      error: {
        code: "SESSION_NOT_EDITABLE",
        message: "Checkout session is already completed.",
      },
    };
  } else {
    const addressStillValid =
      session.selectedAddressId !== null &&
      addresses.some((a) => a.id === session!.selectedAddressId);
    const selectedAddressId = addressStillValid ? session.selectedAddressId : defaultAddress.id;

    // Alamat tidak valid lagi → reset shipping/payment (ongkir bisa berubah).
    // Selain itu, jangan turunkan status jika session sudah lebih lanjut.
    if (!addressStillValid) {
      session = await repository.update({
        sessionId: session.id,
        cartId: cart.cartId,
        itemsSubtotal: cart.itemsSubtotal,
        selectedAddressId,
        selectedShippingOptionId: null,
        selectedShippingServiceName: null,
        selectedShippingFee: null,
        selectedPaymentMethod: null,
        shippingFee: 0,
        grandTotal: cart.itemsSubtotal,
        checkoutStatus: "ADDRESS_CONFIRMED",
      });
    } else {
      const shippingFee = session.selectedShippingFee ?? 0;
      const checkoutStatus =
        session.checkoutStatus === "STARTED" ? "ADDRESS_CONFIRMED" : session.checkoutStatus;

      session = await repository.update({
        sessionId: session.id,
        cartId: cart.cartId,
        itemsSubtotal: cart.itemsSubtotal,
        selectedAddressId,
        checkoutStatus,
        shippingFee,
        grandTotal: calculateGrandTotal(cart.itemsSubtotal, shippingFee),
      });
    }
  }

  const destination =
    addresses.find((a) => a.id === session!.selectedAddressId) ?? defaultAddress;
  const shippingOptions = await shippingPort.listOptions({
    customerId,
    cartId: cart.cartId,
    destinationPostalCode: destination.postalCode,
  });

  return {
    success: true,
    data: { session, shippingOptions, paymentMethods },
  };
}
