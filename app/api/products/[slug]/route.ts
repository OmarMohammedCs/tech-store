import { connectDB } from "@/app/config/db";
import Product from "@/app/models/products";
import "@/app/models/category";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const { slug } =await params;

    const product = await Product.findOne({ slug }).populate('category');

    if (!product) {
      return new Response(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }
    return new Response(JSON.stringify(product), { status: 200 });
    } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}