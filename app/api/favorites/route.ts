import { connectDB } from "@/app/config/db";
import Favorite from "@/app/models/favorites";
import Notification from "@/app/models/notifications";
import "@/app/models/products";
import "@/app/models/users";
import { authMiddleware } from "../middleware/auth.middleware";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authCheck = await authMiddleware(req as any);
    if (authCheck instanceof Response) {
      return authCheck;
    }
    const userId = req.headers.get("userid");
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "User ID is required" }),
        { status: 400 }
      );
    }

    const favorites = await Favorite.find({ user: userId }).populate("product");
    return new Response(JSON.stringify(favorites), { status: 200 });
  } catch (error) {
    console.error("GET /favorites error:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const authCheck = await authMiddleware(req as any);
    if (authCheck instanceof Response) {
      return authCheck;
    }
    const { user, product } = await req.json();

    if (!user || !product) {
      return new Response(
        JSON.stringify({ message: "User and Product are required" }),
        { status: 400 }
      );
    }


    const exists = await Favorite.findOne({ user, product });
    if (exists) {
      return new Response(
        JSON.stringify({ message: "Favorite already exists" }),
        { status: 400 }
      );
    }

    const favorite = await Favorite.create({ user, product });

    await Notification.create({
      user,
      title: "Added to Favorites",
      description: `You added a new product to your favorites!`,
    });

    return new Response(
      JSON.stringify({ message: "Favorite added successfully", favorite }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /favorites error:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const authCheck = await authMiddleware(req as any);
    if (authCheck instanceof Response) {
      return authCheck;
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");
    const userId = req.headers.get("userid");

    if (!productId || !userId) {
      return new Response(
        JSON.stringify({ message: "Favorite ID and User ID are required" }),
        { status: 400 }
      );
    }

    const deleted = await Favorite.findOneAndDelete({
      product: productId,
      user: userId,
    });

    if (!deleted) {
      return new Response(
        JSON.stringify({ message: "Favorite not found" }),
        { status: 404 }
      );
    }

      await Notification.create({
        user: userId,
        title: "Removed from Favorites",
        description: `You removed a product from your favorites!`,
      });

    return new Response(
      JSON.stringify({ message: "Favorite deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /favorites error:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
