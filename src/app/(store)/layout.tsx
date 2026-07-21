import { cartGetCustomerView } from "@/modules/cart/public/cart-service";
import { listPublicCategoriesForCatalog } from "@/modules/catalog/public/catalog-public-service";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { Footer } from "@/shared/ui/layout/footer";
import { Navbar } from "@/shared/ui/layout/navbar";
import type { NavCategoryLink } from "@/shared/ui/layout/navbar-mobile-menu";

const FALLBACK_CATEGORIES: NavCategoryLink[] = [
  { name: "Socks", href: "/products" },
  { name: "Boxer", href: "/products" },
  { name: "Shorts", href: "/products" },
  { name: "Sandals", href: "/products" },
  { name: "Manset", href: "/products" },
];

async function resolveCategories(): Promise<NavCategoryLink[]> {
  try {
    const categories = await listPublicCategoriesForCatalog();
    if (categories.length === 0) return FALLBACK_CATEGORIES;
    return categories.slice(0, 6).map((category) => ({
      name: category.name,
      href: `/products?category=${encodeURIComponent(category.slug)}`,
    }));
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

async function resolveCartCount(): Promise<number> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;
    const view = await cartGetCustomerView(user.id);
    return view.itemCount;
  } catch {
    return 0;
  }
}

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [categories, cartCount] = await Promise.all([resolveCategories(), resolveCartCount()]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar categories={categories} cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
