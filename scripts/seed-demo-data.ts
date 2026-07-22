/**
 * Seed demo: admin awal + kategori + produk ACTIVE + stok inventory.
 *
 * Usage:
 *   bun run db:seed:demo
 *
 * Optional env (.env.local):
 *   SEED_ADMIN_EMAIL=admin@loca.id
 *   SEED_ADMIN_PASSWORD=LocaAdmin!2026
 *   SEED_ADMIN_RESET_PASSWORD=true   # force update password jika user sudah ada
 */

import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@loca.id";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "LocaAdmin!2026";
const RESET_PASSWORD = process.env.SEED_ADMIN_RESET_PASSWORD === "true";
const ACTOR_NAME = "LOCA Seed Admin";

type SeedVariant = {
  sku: string;
  label: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
};

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  thumbnailUrl: string;
  variants: SeedVariant[];
};

const CATEGORIES = [
  { name: "Socks", slug: "socks" },
  { name: "Shorts", slug: "shorts" },
  { name: "Boxer", slug: "boxer" },
  { name: "Tops", slug: "tops" },
  { name: "Accessories", slug: "accessories" },
] as const;

const PRODUCTS: SeedProduct[] = [
  {
    name: "Run Socks Pro",
    slug: "run-socks-pro",
    description:
      "Kaos kaki performa tinggi untuk lari dan aktivitas outdoor. Material breathable dengan cushioning di zona tumit.",
    categorySlug: "socks",
    thumbnailUrl: "https://placehold.co/800x1000/111111/F5F5F5?text=Run+Socks+Pro",
    variants: [
      { sku: "LOCA-RSP-S", label: "S", price: 89_000, stock: 30 },
      { sku: "LOCA-RSP-M", label: "M", price: 99_000, stock: 40 },
      { sku: "LOCA-RSP-L", label: "L", price: 109_000, compareAtPrice: 129_000, stock: 25 },
    ],
  },
  {
    name: "Performance Shorts",
    slug: "performance-shorts",
    description:
      "Celana pendek ringan dan breathable untuk gym, lari, serta aktivitas outdoor harian.",
    categorySlug: "shorts",
    thumbnailUrl: "https://placehold.co/800x1000/111111/F5F5F5?text=Performance+Shorts",
    variants: [
      { sku: "LOCA-PS-S", label: "S", price: 179_000, stock: 20 },
      { sku: "LOCA-PS-M", label: "M", price: 199_000, compareAtPrice: 219_000, stock: 28 },
      { sku: "LOCA-PS-L", label: "L", price: 219_000, stock: 18 },
    ],
  },
  {
    name: "Core Boxer",
    slug: "core-boxer",
    description: "Boxer essentials dengan material moisture-wicking untuk kenyamanan seharian.",
    categorySlug: "boxer",
    thumbnailUrl: "https://placehold.co/800x1000/111111/F5F5F5?text=Core+Boxer",
    variants: [
      { sku: "LOCA-CB-S", label: "S", price: 99_000, stock: 35 },
      { sku: "LOCA-CB-M", label: "M", price: 109_000, stock: 40 },
      { sku: "LOCA-CB-L", label: "L", price: 119_000, stock: 30 },
    ],
  },
  {
    name: "Daily Essential Tee",
    slug: "daily-essential-tee",
    description:
      "Kaos cotton-blend ringan untuk daily wear. Potongan clean dengan logo wordmark LOCA minimal.",
    categorySlug: "tops",
    thumbnailUrl: "https://placehold.co/800x1000/111111/F5F5F5?text=Daily+Essential+Tee",
    variants: [
      { sku: "LOCA-DET-S", label: "S", price: 149_000, stock: 22 },
      { sku: "LOCA-DET-M", label: "M", price: 159_000, stock: 30 },
      { sku: "LOCA-DET-L", label: "L", price: 169_000, stock: 24 },
    ],
  },
  {
    name: "Movement Cap",
    slug: "movement-cap",
    description: "Topi ringan untuk training dan lifestyle. Adjustable strap, siluet clean.",
    categorySlug: "accessories",
    thumbnailUrl: "https://placehold.co/800x1000/111111/F5F5F5?text=Movement+Cap",
    variants: [{ sku: "LOCA-MC-OS", label: "One Size", price: 129_000, stock: 50 }],
  },
];

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

async function ensureAdmin(pool: Pool): Promise<{ id: string; email: string; created: boolean }> {
  const existing = await pool.query<{ id: string; email: string }>(
    `select id, email from auth.users where lower(email) = lower($1) limit 1`,
    [ADMIN_EMAIL],
  );

  if (existing.rows[0]) {
    const userId = existing.rows[0].id;
    await pool.query(
      `update auth.users
       set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || $2::jsonb,
           updated_at = now(),
           email_confirmed_at = coalesce(email_confirmed_at, now())
       where id = $1`,
      [userId, JSON.stringify({ role: "admin", provider: "email", providers: ["email"] })],
    );

    if (RESET_PASSWORD) {
      await pool.query(
        `update auth.users
         set encrypted_password = crypt($2, gen_salt('bf')),
             updated_at = now()
         where id = $1`,
        [userId, ADMIN_PASSWORD],
      );
    }

    const identity = await pool.query(
      `select id from auth.identities where user_id = $1 and provider = 'email' limit 1`,
      [userId],
    );
    if (identity.rows.length === 0) {
      await insertEmailIdentity(pool, userId, ADMIN_EMAIL);
    }

    return { id: userId, email: ADMIN_EMAIL, created: false };
  }

  const inserted = await pool.query<{ id: string }>(
    `insert into auth.users (
       instance_id, id, aud, role, email, encrypted_password,
       email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
       created_at, updated_at, confirmation_token, recovery_token,
       email_change_token_new, email_change, is_super_admin, is_sso_user, is_anonymous
     ) values (
       '00000000-0000-0000-0000-000000000000'::uuid,
       gen_random_uuid(),
       'authenticated',
       'authenticated',
       $1::text,
       crypt($2::text, gen_salt('bf')),
       now(),
       $3::jsonb,
       $4::jsonb,
       now(), now(), '', '', '', '', false, false, false
     )
     returning id`,
    [
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      JSON.stringify({ provider: "email", providers: ["email"], role: "admin" }),
      JSON.stringify({ display_name: ACTOR_NAME }),
    ],
  );

  const userId = inserted.rows[0]!.id;
  await insertEmailIdentity(pool, userId, ADMIN_EMAIL);

  return { id: userId, email: ADMIN_EMAIL, created: true };
}

async function insertEmailIdentity(pool: Pool, userId: string, email: string) {
  // `email` di auth.identities adalah generated column — jangan di-insert.
  await pool.query(
    `insert into auth.identities (
       id, user_id, identity_data, provider, provider_id,
       last_sign_in_at, created_at, updated_at
     )
     select
       gen_random_uuid(),
       u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email',
       u.id::text,
       now(), now(), now()
     from (select $1::uuid as id, $2::text as email) as u`,
    [userId, email],
  );
}

async function seedCatalog(prisma: PrismaClient, adminId: string) {
  const categoryIds = new Map<string, string>();

  for (const category of CATEGORIES) {
    const existing = await prisma.productCategory.findFirst({
      where: { slug: category.slug, isDeleted: false },
    });
    if (existing) {
      categoryIds.set(category.slug, existing.id);
      continue;
    }
    const created = await prisma.productCategory.create({
      data: {
        name: category.name,
        slug: category.slug,
        isActive: true,
        createdBy: adminId,
        updatedBy: adminId,
      },
    });
    categoryIds.set(category.slug, created.id);
    console.log(`  + category ${category.slug}`);
  }

  let productCount = 0;
  let variantCount = 0;
  let stockCount = 0;

  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) throw new Error(`Category missing: ${product.categorySlug}`);

    const prices = product.variants.map((v) => v.price);
    const priceFrom = Math.min(...prices);
    const priceTo = Math.max(...prices);

    let productRow = await prisma.product.findFirst({
      where: { slug: product.slug, isDeleted: false },
    });

    if (!productRow) {
      productRow = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          brand: "LOCA",
          categoryId,
          status: "ACTIVE",
          thumbnailUrl: product.thumbnailUrl,
          variantCount: product.variants.length,
          priceFrom,
          priceTo,
          createdBy: adminId,
          updatedBy: adminId,
        },
      });
      console.log(`  + product ${product.slug}`);
      productCount += 1;
    } else {
      productRow = await prisma.product.update({
        where: { id: productRow.id },
        data: {
          name: product.name,
          description: product.description,
          brand: "LOCA",
          categoryId,
          status: "ACTIVE",
          thumbnailUrl: product.thumbnailUrl,
          variantCount: product.variants.length,
          priceFrom,
          priceTo,
          updatedBy: adminId,
        },
      });
      console.log(`  ~ product ${product.slug}`);
    }

    await prisma.productMedia.deleteMany({
      where: { ownerType: "PRODUCT", ownerId: productRow.id },
    });
    await prisma.productMedia.create({
      data: {
        ownerType: "PRODUCT",
        ownerId: productRow.id,
        mediaType: "IMAGE",
        url: product.thumbnailUrl,
        altText: product.name,
        sortOrder: 0,
        createdBy: adminId,
        updatedBy: adminId,
      },
    });

    await prisma.productSeo.upsert({
      where: { productId: productRow.id },
      create: {
        productId: productRow.id,
        metaTitle: `${product.name} | LOCA`,
        metaDescription: product.description.slice(0, 160),
        canonicalUrl: `/products/${product.slug}`,
        createdBy: adminId,
        updatedBy: adminId,
      },
      update: {
        metaTitle: `${product.name} | LOCA`,
        metaDescription: product.description.slice(0, 160),
        canonicalUrl: `/products/${product.slug}`,
        updatedBy: adminId,
      },
    });

    for (const variant of product.variants) {
      let variantRow = await prisma.productVariant.findFirst({
        where: { sku: variant.sku, isDeleted: false },
      });

      if (!variantRow) {
        variantRow = await prisma.productVariant.create({
          data: {
            productId: productRow.id,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice ?? null,
            variantLabel: variant.label,
            status: "ACTIVE",
            createdBy: adminId,
            updatedBy: adminId,
          },
        });
        variantCount += 1;
        console.log(`    + variant ${variant.sku}`);
      } else {
        variantRow = await prisma.productVariant.update({
          where: { id: variantRow.id },
          data: {
            productId: productRow.id,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice ?? null,
            variantLabel: variant.label,
            status: "ACTIVE",
            updatedBy: adminId,
          },
        });
        console.log(`    ~ variant ${variant.sku}`);
      }

      const inventory = await prisma.inventoryItem.findUnique({
        where: { variantId: variantRow.id },
      });

      if (!inventory) {
        await prisma.inventoryItem.create({
          data: {
            variantId: variantRow.id,
            onHandQty: variant.stock,
            reservedQty: 0,
            availableQty: variant.stock,
            createdBy: adminId,
            updatedBy: adminId,
            movements: {
              create: {
                movementType: "STOCK_IN",
                qtyDelta: variant.stock,
                reason: "Initial demo seed stock",
                referenceType: "SEED",
                referenceId: product.slug,
                createdBy: adminId,
              },
            },
          },
        });
        stockCount += 1;
        console.log(`      + stock ${variant.stock}`);
      } else if (inventory.onHandQty < variant.stock) {
        const delta = variant.stock - inventory.onHandQty;
        await prisma.inventoryItem.update({
          where: { id: inventory.id },
          data: {
            onHandQty: variant.stock,
            availableQty: variant.stock - inventory.reservedQty,
            updatedBy: adminId,
            movements: {
              create: {
                movementType: "STOCK_IN",
                qtyDelta: delta,
                reason: "Top-up demo seed stock",
                referenceType: "SEED",
                referenceId: product.slug,
                createdBy: adminId,
              },
            },
          },
        });
        stockCount += 1;
        console.log(`      ~ stock -> ${variant.stock}`);
      }
    }
  }

  return { productCount, variantCount, stockCount };
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const directUrl = requireEnv("DIRECT_URL");

  console.log("\n🌱 LOCA demo seed");
  console.log(`   admin email: ${ADMIN_EMAIL}`);

  const authPool = new Pool({ connectionString: directUrl, max: 2 });
  const appPool = new Pool({ connectionString: databaseUrl, max: 5 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(appPool) });

  try {
    console.log("\n1) Admin auth user");
    const admin = await ensureAdmin(authPool);
    console.log(
      admin.created
        ? `   ✓ created admin ${admin.email} (${admin.id})`
        : `   ✓ ensured admin ${admin.email} (${admin.id})${RESET_PASSWORD ? " [password reset]" : ""}`,
    );

    console.log("\n2) Catalog + inventory");
    const stats = await seedCatalog(prisma, admin.id);
    console.log(
      `\n✅ Done. New products=${stats.productCount}, new variants=${stats.variantCount}, stock writes=${stats.stockCount}`,
    );
    console.log("\nLogin admin:");
    console.log(`   email   : ${ADMIN_EMAIL}`);
    console.log(`   password: ${ADMIN_PASSWORD}`);
    console.log("   (ganti password setelah login pertama)\n");
  } finally {
    await prisma.$disconnect();
    await appPool.end();
    await authPool.end();
  }
}

main().catch((error) => {
  console.error("\n❌ Seed failed:", error);
  process.exit(1);
});
