import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/mongodb";
import { Category } from "../src/models/Category";
import { Product } from "../src/models/Product";
import { Admin } from "../src/models/Admin";

type CompactMenu = {
  categories: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
    }>;
  }>;
};

type MenuSource = {
  response: {
    location: Array<{
      menu: Array<{
        id: string;
        title: string;
        menu_item: Array<{
          id: string;
          title: string;
          description?: string;
          price: number;
          image_url?: string;
        }>;
      }>;
    }>;
  };
};

function loadMenu(): CompactMenu {
  const compactPath = path.join(process.cwd(), "data", "menu-compact.json");
  if (fs.existsSync(compactPath)) {
    return JSON.parse(fs.readFileSync(compactPath, "utf8")) as CompactMenu;
  }

  const sourcePath = path.join(process.cwd(), "data", "menu-source.json");
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      "Run npm run scrape-menu first, or add data/menu-compact.json",
    );
  }

  const data = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as MenuSource;
  const menus = data.response.location[0]?.menu ?? [];
  return {
    categories: menus.map((cat) => ({
      id: String(cat.id),
      name: cat.title,
      items: (cat.menu_item ?? []).map((item) => ({
        id: String(item.id),
        name: item.title,
        description: item.description ?? "",
        price: Number(item.price) || 0,
        imageUrl: item.image_url ?? "",
      })),
    })),
  };
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in .env.local before seeding");
  }

  const menu = loadMenu();
  await connectDB();

  await Product.deleteMany({});
  await Category.deleteMany({});

  const email =
    process.env.ADMIN_EMAIL ?? "admin@royalgardenrestaurant.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin@123";
  const hash = await bcrypt.hash(password, 10);
  await Admin.findOneAndUpdate(
    { email },
    { email, passwordHash: hash },
    { upsert: true },
  );

  let sortOrder = 0;
  for (const cat of menu.categories) {
    const category = await Category.create({
      externalId: cat.id,
      name: cat.name,
      sortOrder: sortOrder++,
    });

    for (const item of cat.items) {
      await Product.create({
        externalId: item.id,
        categoryId: category._id,
        name: item.name,
        description: item.description ?? "",
        price: item.price,
        imageUrl: item.imageUrl ?? "",
      });
    }
  }

  console.log(
    `Seeded ${menu.categories.length} categories, admin ${email}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
