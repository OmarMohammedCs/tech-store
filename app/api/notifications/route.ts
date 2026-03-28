import { connectDB } from "@/app/config/db";
import Notification from "@/app/models/notifications";
import { authMiddleware } from "../middleware/auth.middleware";

export async function GET(req: Request) {
  try {
    await connectDB();
    const authcheck = await authMiddleware(req as any);
    if (authcheck instanceof Response) {
      return authcheck;
    }

    const userId = req.headers.get("userid");

    if (!userId) {
      return new Response(
        JSON.stringify({ message: "User ID is required" }),
        { status: 400 }
      );
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const authcheck = await authMiddleware(req as any);
    if (authcheck instanceof Response) {
      return authcheck;
    }
    const { userId, title, description } = await req.json();

    if (!userId || !title || !description) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }

    const newNotification = await Notification.create({
      user: userId,
      title,
      description,
    });

    return new Response(JSON.stringify(newNotification), { status: 201 });
  } catch (error) {
    console.error("POST NOTIFICATION ERROR:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
