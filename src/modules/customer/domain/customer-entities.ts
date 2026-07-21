export type CustomerProfile = {
  id: string; // Supabase user ID
  displayName: string;
  phone: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CustomerAddress = {
  id: string;
  customerId: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertCustomerProfileCommand = {
  customerId: string;
  displayName: string;
  phone: string;
  avatarUrl?: string | null;
};

export type CreateAddressCommand = {
  customerId: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
};

export type UpdateAddressCommand = {
  customerId: string;
  addressId: string;
  recipientName?: string;
  phone?: string;
  street?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export type CustomerError =
  | { code: "PROFILE_NOT_FOUND"; message: string }
  | { code: "ADDRESS_NOT_FOUND"; message: string }
  | { code: "DISPLAY_NAME_INVALID"; message: string }
  | { code: "PHONE_INVALID"; message: string };

export type CustomerResult<T> =
  { success: true; data: T } | { success: false; error: CustomerError };
