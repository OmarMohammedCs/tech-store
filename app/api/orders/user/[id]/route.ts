import { connectDB } from "@/app/config/db";
import Order from "@/app/models/order";
import { authMiddleware } from "../../../middleware/auth.middleware";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const authcheck = await authMiddleware(req as any);
    if (authcheck instanceof Response) {
      return authcheck;
    }
    const { id } =await params;

    const product = await Order.find({ user:id }).populate('user');

    if (!product) {
      return new Response(
        JSON.stringify({ message: "ORDER not found" }),
        { status: 404 }
      );
    }
    return new Response(JSON.stringify(product), { status: 200 });
    } catch (error) {
    console.error("GET ORDER ERROR:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}