import type {
  CheckoutResult,
  CheckoutSession,
  SelectAddressCommand,
  SelectPaymentMethodCommand,
  SelectShippingOptionCommand,
  ShippingOption,
} from "../domain/checkout-entities";
import {
  calculateGrandTotal,
  isCheckoutEditable,
  nextStatusAfterAddress,
  nextStatusAfterPayment,
  nextStatusAfterShipping,
} from "../domain/checkout-invariants";
import type { CheckoutRepository } from "../domain/checkout-repository";
import type {
  CheckoutCustomerPort,
  CheckoutPaymentMethodPort,
  CheckoutShippingPort,
} from "./checkout-ports";

async function requireEditableSession(
  repository: CheckoutRepository,
  customerId: string,
): Promise<CheckoutResult<CheckoutSession>> {
  const session = await repository.findOpenByCustomerId(customerId);
  if (!session) {
    return {
      success: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "No open checkout session. Call prepareCheckout first.",
      },
    };
  }
  if (!isCheckoutEditable(session.checkoutStatus)) {
    return {
      success: false,
      error: {
        code: "SESSION_NOT_EDITABLE",
        message: "Checkout session is already completed.",
      },
    };
  }
  return { success: true, data: session };
}

export async function selectCheckoutAddress(
  repository: CheckoutRepository,
  customerPort: CheckoutCustomerPort,
  command: SelectAddressCommand,
): Promise<CheckoutResult<CheckoutSession>> {
  const sessionResult = await requireEditableSession(repository, command.customerId);
  if (!sessionResult.success) return sessionResult;

  const addresses = await customerPort.listAddresses(command.customerId);
  const address = addresses.find((a) => a.id === command.addressId);
  if (!address) {
    return {
      success: false,
      error: {
        code: "ADDRESS_NOT_FOUND",
        message: "Selected address was not found for this customer.",
      },
    };
  }

  const updated = await repository.update({
    sessionId: sessionResult.data.id,
    selectedAddressId: address.id,
    checkoutStatus: nextStatusAfterAddress(),
  });

  return { success: true, data: updated };
}

export async function selectCheckoutShippingOption(
  repository: CheckoutRepository,
  customerPort: CheckoutCustomerPort,
  shippingPort: CheckoutShippingPort,
  command: SelectShippingOptionCommand,
): Promise<CheckoutResult<CheckoutSession>> {
  const sessionResult = await requireEditableSession(repository, command.customerId);
  if (!sessionResult.success) return sessionResult;

  const session = sessionResult.data;
  if (!session.selectedAddressId) {
    return {
      success: false,
      error: {
        code: "ADDRESS_REQUIRED",
        message: "Select a shipping address before choosing a shipping option.",
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

  const options = await shippingPort.listOptions({
    customerId: command.customerId,
    cartId: session.cartId,
    destinationPostalCode: address.postalCode,
  });
  const option = options.find((o) => o.optionId === command.optionId);
  if (!option) {
    return {
      success: false,
      error: {
        code: "SHIPPING_OPTION_INVALID",
        message: "Shipping option is not available for this checkout.",
      },
    };
  }

  const shippingFee = option.shippingFee;
  const updated = await repository.update({
    sessionId: session.id,
    selectedShippingOptionId: option.optionId,
    selectedShippingServiceName: option.serviceName,
    selectedShippingFee: shippingFee,
    shippingFee,
    grandTotal: calculateGrandTotal(session.itemsSubtotal, shippingFee),
    checkoutStatus: nextStatusAfterShipping(session.checkoutStatus),
  });

  return { success: true, data: updated };
}

export async function selectCheckoutPaymentMethod(
  repository: CheckoutRepository,
  paymentPort: CheckoutPaymentMethodPort,
  command: SelectPaymentMethodCommand,
): Promise<CheckoutResult<CheckoutSession>> {
  const sessionResult = await requireEditableSession(repository, command.customerId);
  if (!sessionResult.success) return sessionResult;

  const session = sessionResult.data;
  if (!session.selectedShippingOptionId) {
    return {
      success: false,
      error: {
        code: "CHECKOUT_INCOMPLETE",
        message: "Select a shipping option before choosing a payment method.",
      },
    };
  }

  const methods = await paymentPort.listMethods();
  const method = methods.find((m) => m.method === command.method);
  if (!method) {
    return {
      success: false,
      error: {
        code: "PAYMENT_METHOD_INVALID",
        message: "Payment method is not available for this checkout.",
      },
    };
  }

  const updated = await repository.update({
    sessionId: session.id,
    selectedPaymentMethod: method.method,
    checkoutStatus: nextStatusAfterPayment(),
  });

  return { success: true, data: updated };
}

export async function getShippingOptionsForCheckout(
  repository: CheckoutRepository,
  customerPort: CheckoutCustomerPort,
  shippingPort: CheckoutShippingPort,
  customerId: string,
): Promise<CheckoutResult<{ options: ShippingOption[] }>> {
  const sessionResult = await requireEditableSession(repository, customerId);
  if (!sessionResult.success) return sessionResult;

  const session = sessionResult.data;
  if (!session.selectedAddressId) {
    return {
      success: false,
      error: {
        code: "ADDRESS_REQUIRED",
        message: "Select a shipping address before listing shipping options.",
      },
    };
  }

  const addresses = await customerPort.listAddresses(customerId);
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

  const options = await shippingPort.listOptions({
    customerId,
    cartId: session.cartId,
    destinationPostalCode: address.postalCode,
  });

  return { success: true, data: { options } };
}
