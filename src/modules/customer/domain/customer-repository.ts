import type {
  CustomerAddress,
  CustomerProfile,
  CreateAddressCommand,
  UpdateAddressCommand,
  UpsertCustomerProfileCommand,
} from "./customer-entities";

export interface CustomerRepository {
  findProfileByCustomerId(customerId: string): Promise<CustomerProfile | null>;
  upsertProfile(command: UpsertCustomerProfileCommand): Promise<CustomerProfile>;

  listAddresses(customerId: string): Promise<CustomerAddress[]>;
  findAddressById(id: string, customerId: string): Promise<CustomerAddress | null>;
  createAddress(command: CreateAddressCommand): Promise<CustomerAddress>;
  updateAddress(command: UpdateAddressCommand): Promise<CustomerAddress>;
  softDeleteAddress(id: string, customerId: string): Promise<void>;
  clearDefaultAddress(customerId: string): Promise<void>;
  setDefaultAddress(id: string, customerId: string): Promise<void>;
}
