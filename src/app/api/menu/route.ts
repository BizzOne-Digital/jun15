import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ sortOrder: 1 }).lean();
    const products = await Product.find().lean();

    const payload = categories.map((cat) => ({
      id: String(cat._id),
      name: cat.name,
      products: products
        .filter((p) => String(p.categoryId) === String(cat._id))
        .map((p) => ({
          id: String(p._id),
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
        })),
    }));

    return NextResponse.json({ categories: payload });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load menu" },
      { status: 500 },
    );
  }
}
