"use client";

export type MenuCategory = {
  id: string;
  name: string;
};

type Props = {
  categories: MenuCategory[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function CategoryNav({ categories, activeId, onSelect }: Props) {
  return (
    <div className="sticky top-0 z-30 w-full max-w-full border-b border-[#1e4d3a]/10 bg-[#faf6f0]/95 backdrop-blur pt-safe">
      <div
        className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto overscroll-x-contain px-4 py-2.5 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 sm:py-3 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const active = cat.id === activeId;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`shrink-0 snap-start rounded-full px-4 py-2.5 text-sm font-medium transition min-h-[44px] touch-manipulation ${
                active
                  ? "bg-[#1e4d3a] text-white shadow"
                  : "bg-white text-[#1e4d3a] ring-1 ring-[#1e4d3a]/10 active:bg-[#eef4f1]"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
