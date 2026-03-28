"use client";


import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, X, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import MainLayout from "../mainLayout";
import BreadcrumbsComponent from "@/components/breadcrumbs";
import { Button } from "@heroui/button";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


export default function ShoppingCartClient() {
  const { cart, removeItem, updateQuantity } = useCart();
  const [animateId, setAnimateId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    document.title = "TechStore - Shopping Cart";
  }, [])

  useEffect(() => {
    if (cart.length === 0) {
      toast.error("Your cart is empty! Redirecting to products page...");
        router.push("/products");
      return;
    }
    }, [cart]);


  useEffect(() => {
    if (animateId !== null) {
      const timer = setTimeout(() => setAnimateId(null), 150);
      return () => clearTimeout(timer);
    }
  }, [animateId]);

  return (
    <MainLayout>
      <BreadcrumbsComponent elements={["Home", "Shopping Cart"]} />

      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">

     
        <div className="col-span-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Shopping Cart{" "}
            <span className="text-gray-600 text-lg sm:text-xl">
              ({cart.length} Items)
            </span>
          </h2>

          <Link
            href="/products"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>

   
        <div className="lg:col-span-3 space-y-5">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <Image
                src={item.img}
                alt="product"
                width={160}
                height={160}
                className="rounded-xl object-cover w-full sm:w-[160px] h-[160px]"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start sm:items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                    {item.name}
                  </h2>
                  <Button
                    isIconOnly
                    radius="full"
                    variant="flat"
                    className="text-gray-500 hover:text-red-500"
                    onPress={() => removeItem(item.id)}
                  >
                    <X size={20} />
                  </Button>
                </div>

                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Lorem ipsum dolor sit amet.
                  </p>
                  <p className="text-sm bg-green-100 text-green-700 rounded-md py-0.5 px-1 w-fit font-bold">
                    In Stock
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                  <div className="flex items-center gap-3 dark:bg-gray-800/70 bg-gray-200/70 px-3 py-2 rounded-lg">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      className="text-black dark:text-white border-gray-500"
                      onPress={() => {
                        updateQuantity(item.id, item.quantity + 1);
                        setAnimateId(item.id as any);
                      }}
                    >
                      <Plus size={18} />
                    </Button>

                    <span
                      className={`min-w-[28px] text-center font-semibold text-black dark:text-white transition-transform ${
                        animateId === item.id as any ? "scale-125 text-gray-400" : "scale-100"
                      }`}
                    >
                      {item.quantity}
                    </span>

                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      className="text-black dark:text-white border-gray-500"
                      onPress={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      <Minus size={18} />
                    </Button>
                  </div>

                  <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    ${item.price * item.quantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

     
        <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 space-y-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300">Subtotal</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                ${cart.reduce((total, item) => total + item.price * item.quantity, 0)}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300">Shipping estimate</p>
              <p className="text-green-600 font-semibold">Free</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300">Tax estimate (8%)</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                ${Math.round(cart.reduce((total, item) => total + item.price * item.quantity, 0) * 0.08)}
              </p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 rounded-lg shadow-md transition-all duration-200 px-4 py-3"
          >
            <Lock size={18} />
            Checkout Securely
          </Link>

          <p className="text-center text-gray-500 text-sm">Secure encrypted payment</p>

          <div className="flex justify-center items-center flex-wrap gap-2">
            {["Visa", "MasterCard", "PayPal", "Amex"].map((method, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-lg shadow-sm"
              >
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
