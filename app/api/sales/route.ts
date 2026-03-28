import { connectDB } from "@/app/config/db";
import Order from "@/app/models/order";
import { adminMiddleware } from "../middleware/admin.middleware";

export async function GET(req: Request) {
    try {
        await connectDB();
        const adminCheck = await adminMiddleware(req as any);
        if (adminCheck instanceof Response) {
            return adminCheck;
        }
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    totalProfit: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ])
        return new Response(JSON.stringify(salesData), { status: 200 });
    } catch (error) {
        throw error;
    }
}