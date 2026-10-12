import fs from "fs";
import path from "path";

const API = "https://royalgardenrestaurant.onlineordering.io/api/profile";

async function main() {
  const body = {
    profile_id: "1409419",
    api_key: "bypass",
    location_id: "1409423",
    customize_data: false,
    language: "en",
    app_version: "1.0",
  };

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Scrape failed: ${res.status}`);
  }

  const json = await res.json();
  const menus = json.response?.location?.[0]?.menu ?? [];
  const compact = {
    categories: menus.map(
      (cat: {
        id: string;
        title: string;
        menu_item: Array<{
          id: string;
          title: string;
          description?: string;
          price: number;
          image_url?: string;
        }>;
      }) => ({
        id: String(cat.id),
        name: cat.title,
        items: (cat.menu_item ?? []).map((item) => ({
          id: String(item.id),
          name: item.title,
          description: item.description ?? "",
          price: Number(item.price) || 0,
          imageUrl: item.image_url ?? "",
        })),
      }),
    ),
  };

  const outDir = path.join(process.cwd(), "data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "menu-compact.json"),
    JSON.stringify(compact, null, 2),
  );
  console.log(
    `Saved ${compact.categories.length} categories to data/menu-compact.json`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
