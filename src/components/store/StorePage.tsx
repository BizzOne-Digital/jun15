"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "./Hero";
import { CategoryNav } from "./CategoryNav";
import { ProductCard, type Product } from "./ProductCard";
import { CartDrawer } from "./CartDrawer";
import { CheckoutModal } from "./CheckoutModal";

type CategoryWithProducts = {
  id: string;
  name: string;
  products: Product[];
};

export function StorePage() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        const cats = data.categories ?? [];
        setCategories(cats);
        if (cats[0]) setActiveId(cats[0].id);
      })
      .catch(() => setError("Could not load menu. Run npm run seed."))
      .finally(() => setLoading(false));
  }, []);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeId),
    [categories, activeId],
  );

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#faf6f0] text-[#2a1a0a] pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <header className="w-full max-w-full border-b border-[#1e4d3a]/10 bg-[#f5f3ee] pt-safe">
        <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-3 sm:px-6 sm:py-5">
          <a href="/" className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="Royal Garden Restaurant"
              width={280}
              height={112}
              className="h-12 w-auto max-w-[min(100%,280px)] object-contain sm:h-16 md:h-[4.5rem]"
              priority
            />
          </a>
        </div>
      </header>

      <Hero />

      <section id="menu" className="w-full scroll-mt-24">
        {loading ? (
          <p className="py-16 text-center text-stone-500">Loading menu…</p>
        ) : error ? (
          <p className="py-16 text-center text-red-600">{error}</p>
        ) : categories.length === 0 ? (
          <p className="py-16 text-center text-stone-500">
            No menu items yet. Set MONGODB_URI and run{" "}
            <code className="rounded bg-stone-200 px-1">npm run seed</code>.
          </p>
        ) : (
          <>
            <CategoryNav
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
              activeId={activeId}
              onSelect={setActiveId}
            />
            <div className="mx-auto w-full max-w-6xl min-w-0 px-4 py-6 sm:px-6 sm:py-10">
              <h2 className="mb-4 break-words text-xl font-bold text-[#1e4d3a] sm:mb-6 sm:text-2xl">
                {activeCategory?.name}
              </h2>
              <div className="grid w-full min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {activeCategory?.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <footer className="w-full border-t border-[#1e4d3a]/10 px-4 py-8 text-center text-sm text-stone-500">
        <p>© {new Date().getFullYear()} Royal Garden Restaurant</p>
        <p className="mt-1">296 Smith St, Hinton, AB</p>
      </footer>

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
