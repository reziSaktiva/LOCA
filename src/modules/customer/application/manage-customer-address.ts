import type {
  CreateAddressCommand,
  CustomerAddress,
  CustomerResult,
  UpdateAddressCommand,
} from "../domain/customer-entities";
import { isValidPhone } from "../domain/customer-invariants";
import type { CustomerRepository } from "../domain/customer-repository";

export async function listCustomerAddresses(
  repository: CustomerRepository,
  customerId: string,
): Promise<CustomerAddress[]> {
  return repository.listAddresses(customerId);
}

export async function createCustomerAddress(
  repository: CustomerRepository,
  command: CreateAddressCommand,
): Promise<CustomerResult<CustomerAddress>> {
  if (!isValidPhone(command.phone)) {
    return {
      success: false,
      error: {
        code: "PHONE_INVALID",
        message: "Format nomor telepon tidak valid. Gunakan format: 08xxxx, +62xxxx, atau 62xxxx.",
      },
    };
  }

  if (command.isDefault) {
    await repository.clearDefaultAddress(command.customerId);
  }

  const address = await repository.createAddress(command);
  return { success: true, data: address };
}

export async function updateCustomerAddress(
  repository: CustomerRepository,
  command: UpdateAddressCommand,
): Promise<CustomerResult<CustomerAddress>> {
  const existing = await repository.findAddressById(command.addressId, command.customerId);
  if (!existing) {
    return {
      success: false,
      error: { code: "ADDRESS_NOT_FOUND", message: "Alamat tidak ditemukan." },
    };
  }

  if (command.phone !== undefined && !isValidPhone(command.phone)) {
    return {
      success: false,
      error: {
        code: "PHONE_INVALID",
        message: "Format nomor telepon tidak valid. Gunakan format: 08xxxx, +62xxxx, atau 62xxxx.",
      },
    };
  }

  if (command.isDefault) {
    await repository.clearDefaultAddress(command.customerId);
  }

  const updated = await repository.updateAddress(command);
  return { success: true, data: updated };
}

export async function deleteCustomerAddress(
  repository: CustomerRepository,
  addressId: string,
  customerId: string,
): Promise<CustomerResult<void>> {
  const existing = await repository.findAddressById(addressId, customerId);
  if (!existing) {
    return {
      success: false,
      error: { code: "ADDRESS_NOT_FOUND", message: "Alamat tidak ditemukan." },
    };
  }

  await repository.softDeleteAddress(addressId, customerId);
  return { success: true, data: undefined };
}
