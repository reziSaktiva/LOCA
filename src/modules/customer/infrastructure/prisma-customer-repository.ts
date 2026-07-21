import type {
  CustomerAddress as PrismaAddress,
  CustomerProfile as PrismaProfile,
} from "../../../generated/prisma/client";
import { prisma } from "../../../shared/infrastructure/database/client";
import type {
  CustomerAddress,
  CustomerProfile,
  CreateAddressCommand,
  UpdateAddressCommand,
  UpsertCustomerProfileCommand,
} from "../domain/customer-entities";
import type { CustomerRepository } from "../domain/customer-repository";

function toProfile(row: PrismaProfile): CustomerProfile {
  return {
    id: row.id,
    displayName: row.displayName,
    phone: row.phone,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toAddress(row: PrismaAddress): CustomerAddress {
  return {
    id: row.id,
    customerId: row.customerId,
    recipientName: row.recipientName,
    phone: row.phone,
    street: row.street,
    district: row.district,
    city: row.city,
    province: row.province,
    postalCode: row.postalCode,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaCustomerRepository implements CustomerRepository {
  async findProfileByCustomerId(customerId: string): Promise<CustomerProfile | null> {
    const row = await prisma.customerProfile.findUnique({ where: { id: customerId } });
    return row ? toProfile(row) : null;
  }

  async upsertProfile(command: UpsertCustomerProfileCommand): Promise<CustomerProfile> {
    const row = await prisma.customerProfile.upsert({
      where: { id: command.customerId },
      create: {
        id: command.customerId,
        displayName: command.displayName,
        phone: command.phone,
        avatarUrl: command.avatarUrl ?? null,
        createdBy: command.customerId,
        updatedBy: command.customerId,
      },
      update: {
        displayName: command.displayName,
        phone: command.phone,
        avatarUrl: command.avatarUrl ?? null,
        updatedBy: command.customerId,
      },
    });
    return toProfile(row);
  }

  async listAddresses(customerId: string): Promise<CustomerAddress[]> {
    const rows = await prisma.customerAddress.findMany({
      where: { customerId, isDeleted: false },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    return rows.map(toAddress);
  }

  async findAddressById(id: string, customerId: string): Promise<CustomerAddress | null> {
    const row = await prisma.customerAddress.findFirst({
      where: { id, customerId, isDeleted: false },
    });
    return row ? toAddress(row) : null;
  }

  async createAddress(command: CreateAddressCommand): Promise<CustomerAddress> {
    const row = await prisma.customerAddress.create({
      data: {
        customerId: command.customerId,
        recipientName: command.recipientName,
        phone: command.phone,
        street: command.street,
        district: command.district,
        city: command.city,
        province: command.province,
        postalCode: command.postalCode,
        isDefault: command.isDefault ?? false,
        createdBy: command.customerId,
        updatedBy: command.customerId,
      },
    });
    return toAddress(row);
  }

  async updateAddress(command: UpdateAddressCommand): Promise<CustomerAddress> {
    const row = await prisma.customerAddress.update({
      where: { id: command.addressId },
      data: {
        ...(command.recipientName !== undefined && { recipientName: command.recipientName }),
        ...(command.phone !== undefined && { phone: command.phone }),
        ...(command.street !== undefined && { street: command.street }),
        ...(command.district !== undefined && { district: command.district }),
        ...(command.city !== undefined && { city: command.city }),
        ...(command.province !== undefined && { province: command.province }),
        ...(command.postalCode !== undefined && { postalCode: command.postalCode }),
        ...(command.isDefault !== undefined && { isDefault: command.isDefault }),
        updatedBy: command.customerId,
      },
    });
    return toAddress(row);
  }

  async softDeleteAddress(id: string, customerId: string): Promise<void> {
    await prisma.customerAddress.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: customerId,
      },
    });
  }

  async clearDefaultAddress(customerId: string): Promise<void> {
    await prisma.customerAddress.updateMany({
      where: { customerId, isDefault: true, isDeleted: false },
      data: { isDefault: false },
    });
  }

  async setDefaultAddress(id: string, customerId: string): Promise<void> {
    await prisma.$transaction([
      prisma.customerAddress.updateMany({
        where: { customerId, isDefault: true, isDeleted: false },
        data: { isDefault: false },
      }),
      prisma.customerAddress.update({
        where: { id },
        data: { isDefault: true, updatedBy: customerId },
      }),
    ]);
  }
}
