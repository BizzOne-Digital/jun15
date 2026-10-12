"use client";

import Image from "next/image";
import { useCart } from "@/store/cart";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);

  return (
    <article className="flex min-w-0 w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#1e4d3a]/5">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={640}
            height={480}
            className="h-full w-full object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full min-h-[12rem] items-center justify-center text-amber-800/40">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="break-words font-semibold text-[#2a1a0a]">
          {product.name}
        </h3>
        {product.description ? (
          <p className="line-clamp-2 text-sm text-stone-600">
            {product.description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-lg font-bold text-[#1e4d3a]">
            ${product.price.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
              })
            }
            className="w-full min-h-[48px] shrink-0 rounded-full bg-[#1e4d3a] px-4 py-3 text-sm font-semibold text-white touch-manipulation active:scale-[0.99] hover:bg-[#163a2c] sm:w-auto sm:min-h-0 sm:py-2.5"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
