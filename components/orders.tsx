"use client";

import Image from "next/image";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/app/servise/api";

interface OrderItem {
  product: string;
  quantity: number;
  _id: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  orderItems: OrderItem[];
  address: string;
  city: string;
  phone: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersComponent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        if (!user?._id && !user?.id) {
          setError("User not found. Please login.");
          setLoading(false);
          return;
        }

        const userId = user._id || user.id;
        const res = await api.orders.getByUser(userId);
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <div>
                <p className="font-semibold text-lg">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <OrderStatus status={order.status} />
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium">{order.address}</p>
                </div>
                <div>
                  <p className="text-gray-500">City</p>
                  <p className="font-medium">{order.city}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium uppercase">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {order.orderItems.map((item, i) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center py-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">Product ID: {item.product.slice(-6)}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Items */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <p className="text-gray-500">Total Items</p>
                <p className="font-semibold">
                  {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Order Status Badge */
function OrderStatus({ status }: { status: string }) {
  const base =
    "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium capitalize";

  const statusConfig: Record<string, { color: string; icon: JSX.Element }> = {
    delivered: {
      color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      icon: <CheckCircle size={16} />,
    },
    shipped: {
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      icon: <Truck size={16} />,
    },
    pending: {
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      icon: <Clock size={16} />,
    },
    cancelled: {
      color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      icon: <XCircle size={16} />,
    },
    processing: {
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      icon: <Package size={16} />,
    },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`${base} ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
}