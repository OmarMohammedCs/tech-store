"use client";

import { useEffect, useState } from "react";
import BreadcrumbsComponent from "@/components/breadcrumbs";
import MainLayout from "../mainLayout";
import Image from "next/image";
import { Button, Checkbox, Input, RadioGroup, Radio } from "@heroui/react";
import toast from "react-hot-toast";
import { useCart } from "../store/CartStore";
import api from "../servise/api";

export default function Checkout() {
  const { cart } = useCart();

  const [code, setCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shipping = cart.length > 0 ? 20 : 0;
  const total = subtotal + shipping;

  /* ---------------- Load user safely ---------------- */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      setEmail(user?.email || "");
      setName(user?.name || "");
    } catch (err) {
      console.error("Failed to parse user:", err);
    }
  }, []);

  /* ---------------- Coupon ---------------- */
  const handleApplyCode = () => {
    if (!code.trim()) {
      toast.error("Please enter a code");
      return;
    }

    toast.error("Invalid code");
    setCode("");
  };

  /* ---------------- Order ---------------- */
  const handleOrderSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to place an order");
        return;
      }

      if (!address || !city || !phone) {
        toast.error("Please fill all shipping details");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      const orderData = {
        user: storedUser?.id,
        orderItems: cart.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        address,
        city,
        phone,
        paymentMethod,
        totalPrice: total,
      };

      const res = await api.orders.create(orderData);

      toast.success("Order placed successfully");
      console.log(res.data);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Order failed");
    }
  };

  return (
    <MainLayout>
      <BreadcrumbsComponent elements={["Home", "Cart", "Checkout"]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <Section>
            <h2 className="section-title mb-4">Contact Information</h2>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Checkbox className="mt-3 text-sm" defaultSelected>
              Email me with news and offers
            </Checkbox>
          </Section>

          {/* Shipping */}
          <Section>
            <h2 className="section-title mb-4">Shipping Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Address" className="md:col-span-2" onChange={(e) => setAddress(e.target.value)} />
              <Input label="City" onChange={(e) => setCity(e.target.value)} />
              <Input label="Phone" onChange={(e) => setPhone(e.target.value)} />
            </div>
          </Section>

          {/* Payment */}
          <Section>
            <h2 className="section-title mb-4">Payment</h2>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(val: string) =>
                setPaymentMethod(val as "cod" | "online")
              }
            >
              <Radio value="cod">Cash on Delivery</Radio>
              <Radio value="online">Online Payment</Radio>
            </RadioGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Card Number"
                isDisabled={paymentMethod !== "online"}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <Input
                label="Expiry Date"
                type="month"
                isDisabled={paymentMethod !== "online"}
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
              <Input
                label="CVV"
                isDisabled={paymentMethod !== "online"}
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
              />
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <Image
                    src={item.img}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${item.price * item.quantity}
                  </p>
                </div>
              ))
            )}

            <div className="flex gap-2">
              <Input
                size="sm"
                placeholder="Coupon code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button size="sm" variant="bordered" onClick={handleApplyCode}>
                Apply
              </Button>
            </div>

            <Divider />

            <PriceRow label="Subtotal" value={`$${subtotal}`} />
            <PriceRow label="Shipping" value={`$${shipping}`} />
            <PriceRow label="Total" value={`$${total}`} bold />

            <Button
              color="primary"
              className="w-full"
              onClick={handleOrderSubmit}
            >
              PAY NOW
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/* ---------------- Helpers ---------------- */

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
      {children}
    </div>
  );
}

function PriceRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        bold ? "font-bold text-lg" : "text-sm"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Divider() {
  return <hr className="my-2 border-gray-200 dark:border-gray-700" />;
}