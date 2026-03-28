import { connectDB } from "@/app/config/db";
import Product from "@/app/models/products";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const products = await Product.find({ name: { $regex: query, $options: "i" } }).populate("category");
    return NextResponse.json(products);
  } catch (error) {
    console.error("SEARCH PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 