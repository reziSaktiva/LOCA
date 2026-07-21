import { describe, expect, it } from "vitest";
import type { CustomerAddress, CustomerProfile } from "../domain/customer-entities";
import type { CustomerRepository } from "../domain/customer-repository";
import { isValidDisplayName, isValidPhone } from "../domain/customer-invariants";
import { getCustomerProfile, upsertCustomerProfile } from "./manage-customer-profile";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  updateCustomerAddress,
} from "./manage-customer-address";

// ---------------------------------------------------------------------------
// In-memory stub repository
// ---------------------------------------------------------------------------

function makeProfile(override: Partial<CustomerProfile> = {}): CustomerProfile {
  return {
    id: "user-1",
    displayName: "Rezi Saktiva",
    phone: "081234567890",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

function makeAddress(override: Partial<CustomerAddress> = {}): CustomerAddress {
  return {
    id: "addr-1",
    customerId: "user-1",
    recipientName: "Rezi",
    phone: "081234567890",
    street: "Jl. Contoh No. 1",
    district: "Kecamatan A",
    city: "Kota B",
    province: "Jawa Barat",
    postalCode: "40123",
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

function makeRepository(
  profiles: CustomerProfile[] = [],
  addresses: CustomerAddress[] = [],
): CustomerRepository {
  const profileStore = [...profiles];
  const addressStore = [...addresses];

  return {
    async findProfileByCustomerId(customerId) {
      return profileStore.find((p) => p.id === customerId) ?? null;
    },
    async upsertProfile(command) {
      const existing = profileStore.findIndex((p) => p.id === command.customerId);
      const profile: CustomerProfile = {
        id: command.customerId,
        displayName: command.displayName,
        phone: command.phone,
        avatarUrl: command.avatarUrl ?? null,
        createdAt: existing >= 0 ? profileStore[existing].createdAt : new Date(),
        updatedAt: new Date(),
      };
      if (existing >= 0) {
        profileStore[existing] = profile;
      } else {
        profileStore.push(profile);
      }
      return profile;
    },
    async listAddresses(customerId) {
      return addressStore.filter((a) => a.customerId === customerId);
    },
    async findAddressById(id, customerId) {
      return addressStore.find((a) => a.id === id && a.customerId === customerId) ?? null;
    },
    async createAddress(command) {
      const address: CustomerAddress = {
        id: `addr-${addressStore.length + 1}`,
        customerId: command.customerId,
        recipientName: command.recipientName,
        phone: command.phone,
        street: command.street,
        district: command.district,
        city: command.city,
        province: command.province,
        postalCode: command.postalCode,
        isDefault: command.isDefault ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addressStore.push(address);
      return address;
    },
    async updateAddress(command) {
      const idx = addressStore.findIndex(
        (a) => a.id === command.addressId && a.customerId === command.customerId,
      );
      if (idx < 0) throw new Error("Address not found");
      const updated: CustomerAddress = {
        ...addressStore[idx],
        recipientName: command.recipientName ?? addressStore[idx].recipientName,
        phone: command.phone ?? addressStore[idx].phone,
        street: command.street ?? addressStore[idx].street,
        district: command.district ?? addressStore[idx].district,
        city: command.city ?? addressStore[idx].city,
        province: command.province ?? addressStore[idx].province,
        postalCode: command.postalCode ?? addressStore[idx].postalCode,
        isDefault: command.isDefault ?? addressStore[idx].isDefault,
        updatedAt: new Date(),
      };
      addressStore[idx] = updated;
      return updated;
    },
    async softDeleteAddress(id, customerId) {
      const idx = addressStore.findIndex((a) => a.id === id && a.customerId === customerId);
      if (idx >= 0) addressStore.splice(idx, 1);
    },
    async clearDefaultAddress(customerId) {
      for (const a of addressStore) {
        if (a.customerId === customerId) a.isDefault = false;
      }
    },
    async setDefaultAddress(id, customerId) {
      for (const a of addressStore) {
        if (a.customerId === customerId) a.isDefault = a.id === id;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Invariant tests
// ---------------------------------------------------------------------------

describe("isValidDisplayName", () => {
  it("accepts valid names", () => {
    expect(isValidDisplayName("Rezi")).toBe(true);
    expect(isValidDisplayName("Rezi Saktiva")).toBe(true);
    expect(isValidDisplayName("AB")).toBe(true);
  });

  it("rejects too short", () => {
    expect(isValidDisplayName("A")).toBe(false);
    expect(isValidDisplayName("")).toBe(false);
    expect(isValidDisplayName("  ")).toBe(false);
  });

  it("rejects too long (>100 chars)", () => {
    expect(isValidDisplayName("A".repeat(101))).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts valid Indonesian numbers", () => {
    expect(isValidPhone("081234567890")).toBe(true);
    expect(isValidPhone("+6281234567890")).toBe(true);
    expect(isValidPhone("6281234567890")).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(isValidPhone("12345")).toBe(false);
    expect(isValidPhone("abcdefgh")).toBe(false);
    expect(isValidPhone("+1234567890")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Profile service tests
// ---------------------------------------------------------------------------

describe("getCustomerProfile", () => {
  it("returns profile if found", async () => {
    const profile = makeProfile();
    const repo = makeRepository([profile]);
    const result = await getCustomerProfile(repo, "user-1");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.displayName).toBe("Rezi Saktiva");
  });

  it("returns PROFILE_NOT_FOUND if not exists", async () => {
    const repo = makeRepository();
    const result = await getCustomerProfile(repo, "no-user");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("PROFILE_NOT_FOUND");
  });
});

describe("upsertCustomerProfile", () => {
  it("creates profile with valid data", async () => {
    const repo = makeRepository();
    const result = await upsertCustomerProfile(repo, {
      customerId: "user-1",
      displayName: "Rezi",
      phone: "081234567890",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Rezi");
      expect(result.data.phone).toBe("081234567890");
    }
  });

  it("updates existing profile", async () => {
    const repo = makeRepository([makeProfile()]);
    const result = await upsertCustomerProfile(repo, {
      customerId: "user-1",
      displayName: "Nama Baru",
      phone: "+6281234567890",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.displayName).toBe("Nama Baru");
  });

  it("rejects invalid display name", async () => {
    const repo = makeRepository();
    const result = await upsertCustomerProfile(repo, {
      customerId: "user-1",
      displayName: "A",
      phone: "081234567890",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("DISPLAY_NAME_INVALID");
  });

  it("rejects invalid phone", async () => {
    const repo = makeRepository();
    const result = await upsertCustomerProfile(repo, {
      customerId: "user-1",
      displayName: "Rezi",
      phone: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("PHONE_INVALID");
  });
});

// ---------------------------------------------------------------------------
// Address service tests
// ---------------------------------------------------------------------------

describe("listCustomerAddresses", () => {
  it("returns addresses for customer", async () => {
    const repo = makeRepository(
      [],
      [makeAddress(), makeAddress({ id: "addr-2", customerId: "user-2" })],
    );
    const result = await listCustomerAddresses(repo, "user-1");
    expect(result).toHaveLength(1);
    expect(result[0].customerId).toBe("user-1");
  });

  it("returns empty array if no addresses", async () => {
    const repo = makeRepository();
    const result = await listCustomerAddresses(repo, "user-1");
    expect(result).toHaveLength(0);
  });
});

describe("createCustomerAddress", () => {
  it("creates address with valid data", async () => {
    const repo = makeRepository();
    const result = await createCustomerAddress(repo, {
      customerId: "user-1",
      recipientName: "Rezi",
      phone: "081234567890",
      street: "Jl. Test",
      district: "Kec. A",
      city: "Kota B",
      province: "Jawa Barat",
      postalCode: "40123",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.recipientName).toBe("Rezi");
  });

  it("clears other defaults when isDefault=true", async () => {
    const repo = makeRepository([], [makeAddress({ isDefault: true })]);
    const result = await createCustomerAddress(repo, {
      customerId: "user-1",
      recipientName: "Baru",
      phone: "081234567890",
      street: "Jl. Baru",
      district: "Kec. Baru",
      city: "Kota Baru",
      province: "Jawa Timur",
      postalCode: "60001",
      isDefault: true,
    });
    expect(result.success).toBe(true);
    const list = await listCustomerAddresses(repo, "user-1");
    const defaults = list.filter((a) => a.isDefault);
    expect(defaults).toHaveLength(1);
    if (result.success) expect(defaults[0].id).toBe(result.data.id);
  });

  it("rejects invalid phone", async () => {
    const repo = makeRepository();
    const result = await createCustomerAddress(repo, {
      customerId: "user-1",
      recipientName: "Rezi",
      phone: "bad-phone",
      street: "Jl. Test",
      district: "Kec. A",
      city: "Kota B",
      province: "Jawa Barat",
      postalCode: "40123",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("PHONE_INVALID");
  });
});

describe("updateCustomerAddress", () => {
  it("updates existing address", async () => {
    const repo = makeRepository([], [makeAddress()]);
    const result = await updateCustomerAddress(repo, {
      customerId: "user-1",
      addressId: "addr-1",
      city: "Kota Baru",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.city).toBe("Kota Baru");
  });

  it("returns ADDRESS_NOT_FOUND for unknown address", async () => {
    const repo = makeRepository([], [makeAddress()]);
    const result = await updateCustomerAddress(repo, {
      customerId: "user-1",
      addressId: "addr-999",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ADDRESS_NOT_FOUND");
  });

  it("rejects invalid phone on update", async () => {
    const repo = makeRepository([], [makeAddress()]);
    const result = await updateCustomerAddress(repo, {
      customerId: "user-1",
      addressId: "addr-1",
      phone: "bad-phone",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("PHONE_INVALID");
  });
});

describe("deleteCustomerAddress", () => {
  it("deletes existing address", async () => {
    const repo = makeRepository([], [makeAddress()]);
    const result = await deleteCustomerAddress(repo, "addr-1", "user-1");
    expect(result.success).toBe(true);
    const list = await listCustomerAddresses(repo, "user-1");
    expect(list).toHaveLength(0);
  });

  it("returns ADDRESS_NOT_FOUND for unknown address", async () => {
    const repo = makeRepository();
    const result = await deleteCustomerAddress(repo, "addr-999", "user-1");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ADDRESS_NOT_FOUND");
  });

  it("cannot delete address belonging to another customer", async () => {
    const repo = makeRepository([], [makeAddress({ customerId: "user-2" })]);
    const result = await deleteCustomerAddress(repo, "addr-1", "user-1");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("ADDRESS_NOT_FOUND");
  });
});
