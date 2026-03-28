"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import {
  Menu,
  Home,
  User,
  ShoppingBag,
  Bell,
} from "lucide-react";

export default function AdminMenu() {
  const [open, setOpen] = useState(false);



  return (
    <div className="relative"> 
      <Button
        isIconOnly
        onPress={() => setOpen(!open)} 
      >
        <Menu size={22} />
      </Button>

 
      {open && (
        <Card className="absolute right-0 mt-2 w-64 p-2 shadow-lg z-50">
<Listbox aria-label="Admin Dashboard Menu">
  <ListboxItem
    key="dashboard"
    startContent={<Home size={18} />}
    href="/dashboard"
  >
    Dashboard
  </ListboxItem>

  <ListboxItem
    key="users"
    startContent={<User size={18} />}
    href="/dashboard/users"
  >
    Users
  </ListboxItem>

  <ListboxItem
    key="products"
    startContent={<ShoppingBag size={18} />}
      href="/dashboard/products"
  >
    Products
  </ListboxItem>

  <ListboxItem
    key="orders"
    startContent={<Bell size={18} />}
      href="/dashboard/orders"
  >
    Orders
  </ListboxItem>

</Listbox>
        </Card>
      )}
    </div>
  );
}
