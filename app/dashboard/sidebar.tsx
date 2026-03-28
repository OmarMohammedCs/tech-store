"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Bug,
  BaggageClaim,
} from "lucide-react";

const items = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
  { name: "Customers", icon: Users, href: "/dashboard/customers" },
  { name: "Products", icon: BaggageClaim, href: "/dashboard/products" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">

    
      <div className="h-16 flex items-center px-6 text-xl font-bold tracking-wide">
        Admin<span className="text-indigo-600">Panel</span>
      </div>

 
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
             
              <item.icon
                size={18}
                className={`transition ${
                  isActive
                    ? "text-indigo-600"
                    : "group-hover:text-indigo-500"
                }`}
              />

              <span className="flex-1">{item.name}</span>


            </Link>
          );
        })}
      </nav>

    
    </aside>
  );
}
