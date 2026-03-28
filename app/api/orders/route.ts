import { connectDB } from '@/app/config/db';
import Order from '@/app/models/order';
import { NextResponse } from 'next/server';
import "@/app/models/users";
import Notification from '@/app/models/notifications';
import { authMiddleware } from '../middleware/auth.middleware';


interface OrderItemBody {
  user: string;
  orderItems: {
    product: string;
    quantity: number;
  };
  address: string;
  city: string;
  phone: number;
  paymentMethod: string;
  status?: string;
  totalPrice: number;
}

interface PutOrderBody {
  user: string;
  orderId: string;
  status?: string;
}


export async function GET(req: Request) {
  try {
    await connectDB();
    const checkAuth = await authMiddleware(req as any);
    if (checkAuth instanceof NextResponse) {
      return checkAuth;
    }
    const orders = await Order.find().populate("user", "name email")
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET /orders error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    await connectDB();
    const checkAuth = await authMiddleware(req as any);
    if (checkAuth instanceof NextResponse) {
      return checkAuth;
    }

    const body: OrderItemBody = await req.json();
    const { user, address, orderItems, city, phone, paymentMethod, totalPrice } = body;

    console.log("Received order data:", body);

    if (!user || !address || !city || !phone || !paymentMethod || totalPrice == null || !orderItems) {
      return NextResponse.json(
        { message: "All filds are required" },
        { status: 400 }
      );
    }
    const newOrder = new Order({
      user,
      orderItems,
      address,
      city,
      phone,
      paymentMethod,
      totalPrice: Number(totalPrice),
    });
    await newOrder.save();

    await Notification.create({
      user,
      title: "New Order Placed",
      description: `Your order with ID ${newOrder._id} has been placed successfully!`,
    });

    return NextResponse.json(
      { message: "Order placed successfully", order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /order error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    await connectDB();
    const checkAuth = await authMiddleware(req as any);
    if (checkAuth instanceof NextResponse) {
      return checkAuth;
    }
    const body: PutOrderBody = await req.json();
    const { status, orderId } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status is equired" },
        { status: 400 }
      );
    }
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }



    return NextResponse.json(
      { message: "Order updated successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /cart error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
