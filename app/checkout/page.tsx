"use client";

import { useEffect, useState } from "react";
import BreadcrumbsComponent from "@/components/breadcrumbs";
import MainLayout from "../mainLayout";
import Image from "next/image";
import { Button, Checkbox, Input, RadioGroup, Radio } from "@heroui/react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import api from "../servise/api";

export default function Checkout() {
  const [code, setCode] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expDate, setExpDate] = useState<string>("");
  const [securityCode, setSecurityCode] = useState<string>("");
    const [email, setEmail] = useState("");
  const [name, setName] = useState("");


  const { cart, removeItem, updateQuantity } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = cart.length > 0 ? 20 : 0;
  const total = subtotal + shipping;

  const handleApplyCode = () => {
    if (!code) {
      return toast.error("Please enter a code");
    }
    toast.error("This is an invalid code");
    setCode("");
  };
 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setEmail(user.email || "");
    setName(user.name || "");
  }, []);
  // information about user
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

const handleOrderSubmit = async () => {
  if (localStorage.getItem("token") === null) {
    toast.error("Please log in to place an order");
    return;
  }

  if (!address || !city || !phone) {
    toast.error("Please fill all shipping details");
    return;
  }

  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    const orderData = {
      user: storedUser.id,
      orderItems: cart.map(item => ({
        product: item.id,
        quantity: item.quantity
      })),
      address,
      city,
      phone: Number(phone),
      paymentMethod,
      totalPrice: total
    };
    console.log("Order Items:", orderData);

    const res = await api.orders.create(orderData)


    toast.success("Order placed successfully");
    console.log(res.data);

  } catch (error: any) {
    console.error(error);
    toast.error(error?.response?.data?.message || "Order failed");
  }
};



  return (
    <MainLayout>
      <BreadcrumbsComponent elements={["Home", "Shopping Cart", "Checkout"]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Contact */}
          <Section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="section-title">Contact Information</h2>
            </div>

            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Checkbox defaultSelected className="mt-3 text-sm">
              Email me with news and offers
            </Checkbox>
          </Section>

          {/* Shipping */}
          <Section>
            <h2 className="section-title mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Last Name" />
              <Input label="Address" className="md:col-span-2" onChange={(e) => setAddress(e.target.value)} />
              <Input label="City" onChange={(e) => setCity(e.target.value)} />
              <Input label="Phone" onChange={(e) => setPhone(e.target.value)} />
            </div>
          </Section>

          {/* Shipping Method */}
          <Section>
            <h2 className="section-title mb-4">Shipping Method</h2>
            <RadioGroup defaultValue="standard">
              <Radio value="standard" description="3–5 business days">Standard Delivery</Radio>
              <Radio value="express" description="1–2 business days">Express Delivery</Radio>
            </RadioGroup>
          </Section>

          {/* Payment */}
          <Section>
            <h2 className="section-title mb-4">Payment</h2>
            <RadioGroup
              value={paymentMethod}
              // RadioGroup expects (value: string) => void, but setPaymentMethod expects SetStateAction<"cod" | "online">.
              // Fix: Wrap in a function that casts to correct type.
              onValueChange={(val: string) => setPaymentMethod(val as "cod" | "online")}
            >
              <Radio value="cod" description="Cash or card on delivery">Pay on Delivery</Radio>
              <Radio value="online" description="Credit/debit card, UPI, wallets etc.">Pay Online</Radio>
            </RadioGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                label="Card Number"
                isDisabled={paymentMethod !== "online"}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <Input
                label="Expiration Date"
                type="month"
                isDisabled={paymentMethod !== "online"}
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
              />
              <Input
                label="Security Code"
                isDisabled={paymentMethod !== "online"}
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
              />
            </div>
          </Section>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm space-y-4">

            <h2 className="text-lg font-semibold">Order Summary</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Image
                    src={item.img}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${item.price * item.quantity}</p>
                </div>
              ))
            )}

            {/* Coupon */}
            <div className="flex gap-2 pt-2">
              <Input size="sm" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} />
              <Button size="sm" variant="bordered" onClick={handleApplyCode}>Apply</Button>
            </div>

            <Divider />

            <PriceRow label="Subtotal" value={`$${subtotal}`} />
            <PriceRow label="Shipping" value={`$${shipping}`} />
            <PriceRow label="Total" value={`$${total}`} bold />

            <Button color="primary" size="lg" className="w-full" onClick={handleOrderSubmit}>PAY NOW</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

/* ---------- Helpers ---------- */
function Section({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">{children}</div>;
}

function PriceRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-bold text-lg" : "text-sm"}`}><span>{label}</span><span>{value}</span></div>;
}

function Divider() {
  return <hr className="border-gray-200 dark:border-gray-700 my-2" />;
}
