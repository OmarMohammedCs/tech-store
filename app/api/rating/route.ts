import { connectDB } from "@/app/config/db";
import Rating from "@/app/models/rating";
import { NextResponse } from "next/server";
import "@/app/models/users";
import Notification from "@/app/models/notifications";
import { authMiddleware } from "../middleware/auth.middleware";

interface RatingBody {
    user: string;
    product: string;
    rating: number;
    comment?: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const authCheck = await authMiddleware(req as any);

    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    if (typeof authCheck === "string") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = authCheck.id;

    const body = await req.json();

    const { product, rating, comment } = body;

    if (!product || !rating) {
      return NextResponse.json(
        { message: "Product and rating required" },
        { status: 400 }
      );
    }

    const existingRating = await Rating.findOne({
      user: userId,
      product,
    });

    if (existingRating) {
      return NextResponse.json(
        { message: "You already rated this product" },
        { status: 400 }
      );
    }

    const newRating = await Rating.create({
      user: userId,
      product,
      rating,
      comment,
    });

 
    await Notification.create({
      user: userId,
      title: "New Rating",
      description: "You rated a product",
    });

    return NextResponse.json(
      {
        message: "Rating submitted",
        rating: newRating,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

  
 
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const product = searchParams.get("product");
    const user = searchParams.get("user");

    if (!product) {
      return NextResponse.json(
        { message: "product is required" },
        { status: 400 }
      );
    }

    const query: any = { product };
    if (user) query.user = user;

    const ratings = await Rating.find(query)
      .populate("user")
      .populate("product");

    return NextResponse.json(ratings, { status: 200 });
  } catch (error) {
    console.error("GET /rating error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
