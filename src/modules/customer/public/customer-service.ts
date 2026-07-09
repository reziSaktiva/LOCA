import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  updateCustomerAddress,
} from "../application/manage-customer-address";
import { getCustomerProfile, upsertCustomerProfile } from "../application/manage-customer-profile";
import type {
  CreateAddressCommand,
  CustomerAddress,
  CustomerProfile,
  CustomerResult,
  UpdateAddressCommand,
  UpsertCustomerProfileCommand,
} from "../domain/customer-entities";
import { PrismaCustomerRepository } from "../infrastructure/prisma-customer-repository";

export type {
  CreateAddressCommand,
  CustomerAddress,
  CustomerError,
  CustomerProfile,
  CustomerResult,
  UpdateAddressCommand,
  UpsertCustomerProfileCommand,
} from "../domain/customer-entities";

const repository = new PrismaCustomerRepository();

export async function customerGetProfile(customerId: string): Promise<CustomerResult<CustomerProfile>> {
  return getCustomerProfile(repository, customerId);
}

export async function customerUpsertProfile(
  command: UpsertCustomerProfileCommand,
): Promise<CustomerResult<CustomerProfile>> {
  return upsertCustomerProfile(repository, command);
}

export async function customerListAddresses(customerId: string): Promise<CustomerAddress[]> {
  return listCustomerAddresses(repository, customerId);
}

export async function customerCreateAddress(
  command: CreateAddressCommand,
): Promise<CustomerResult<CustomerAddress>> {
  return createCustomerAddress(repository, command);
}

export async function customerUpdateAddress(
  command: UpdateAddressCommand,
): Promise<CustomerResult<CustomerAddress>> {
  return updateCustomerAddress(repository, command);
}

export async function customerDeleteAddress(
  addressId: string,
  customerId: string,
): Promise<CustomerResult<void>> {
  return deleteCustomerAddress(repository, addressId, customerId);
}
