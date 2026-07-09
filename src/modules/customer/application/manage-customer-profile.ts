import type { CustomerProfile, CustomerResult, UpsertCustomerProfileCommand } from "../domain/customer-entities";
import { isValidDisplayName, isValidPhone } from "../domain/customer-invariants";
import type { CustomerRepository } from "../domain/customer-repository";

export async function getCustomerProfile(
  repository: CustomerRepository,
  customerId: string,
): Promise<CustomerResult<CustomerProfile>> {
  const profile = await repository.findProfileByCustomerId(customerId);

  if (!profile) {
    return {
      success: false,
      error: { code: "PROFILE_NOT_FOUND", message: "Profil customer tidak ditemukan." },
    };
  }

  return { success: true, data: profile };
}

export async function upsertCustomerProfile(
  repository: CustomerRepository,
  command: UpsertCustomerProfileCommand,
): Promise<CustomerResult<CustomerProfile>> {
  if (!isValidDisplayName(command.displayName)) {
    return {
      success: false,
      error: {
        code: "DISPLAY_NAME_INVALID",
        message: "Nama harus antara 2–100 karakter.",
      },
    };
  }

  if (!isValidPhone(command.phone)) {
    return {
      success: false,
      error: {
        code: "PHONE_INVALID",
        message: "Format nomor telepon tidak valid. Gunakan format: 08xxxx, +62xxxx, atau 62xxxx.",
      },
    };
  }

  const profile = await repository.upsertProfile(command);
  return { success: true, data: profile };
}
