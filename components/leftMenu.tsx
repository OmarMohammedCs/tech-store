"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  useDisclosure,
  Listbox,
  ListboxItem,
  Divider,
} from "@heroui/react";

import {
  Menu,
  Home,
  ShoppingBag,
  Bell,
  User,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Package,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MenuComponent({
  user,
  setUpdateNotes,
  updateNotes,

  
}: {
  user: any;
  setUpdateNotes: React.Dispatch<React.SetStateAction<number>>;
  updateNotes: number;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [openDashboard, setOpenDashboard] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (localUser.role === "admin") {
      setOpenDashboard(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleNavigation = (key: string) => {
    const routes: Record<string, string> = {
      home: "/",
      products: "/products",
      profile: `/u/${user?.userName}`,
      cart: "/shopping-cart",
      dashboard: "/dashboard",
      users: "/dashboard/users",
      "products-admin": "/dashboard/products",
      orders: "/dashboard/orders",
    };

    if (routes[key]) {
      router.push(routes[key]);
    }
  };

  return (
    <>
      {/* Menu Button */}
      <Button onPress={onOpen} isIconOnly variant="flat" className="md:hidden">
        <Menu />
      </Button>

      {/* Drawer */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="text-center font-bold text-lg">
                Menu
              </DrawerHeader>

              <DrawerBody className="px-3 pb-6">

                {/* MAIN MENU */}
                <Listbox
                  aria-label="Main Navigation"
                  variant="flat"
                  className="gap-2 w-full"
                  onAction={(key) => {
                    if (key === "notifications") {
                     setUpdateNotes((prev) => prev + 1);
                      onClose();
                      return;
                    }

                    handleNavigation(key as string);
                    onClose();
                  }}
                >
                  <ListboxItem
                    key="home"
                    startContent={<Home size={22} />}
                    className="py-4"
                  >
                    Home
                  </ListboxItem>

                  <ListboxItem
                    key="products"
                    startContent={<ShoppingBag size={22} />}
                    className="py-4"
                  >
                    Products
                  </ListboxItem>

                  <ListboxItem
                    key="cart"
                    startContent={<ShoppingCart size={22} />}
                    className="py-4"
                  >
                    Cart
                  </ListboxItem>

                  {/* ✅ Notifications FIXED */}
                  <ListboxItem
                    key="notifications"
                    startContent={<Bell size={22} />}
                    className="py-4"
                  >
                    Notifications
                  </ListboxItem>

                  <ListboxItem
                    key="profile"
                    startContent={<User size={22} />}
                    className="py-4"
                  >
                    Profile
                  </ListboxItem>
                </Listbox>

                {/* ADMIN */}
                {openDashboard && (
                  <>
                    <Divider className="my-4" />

                    <Listbox
                      aria-label="Admin Navigation"
                      variant="flat"
                      className="gap-2 w-full"
                      onAction={(key) => {
                        handleNavigation(key as string);
                        onClose();
                      }}
                    >
                      <ListboxItem
                        key="dashboard"
                        startContent={<LayoutDashboard size={22} />}
                        className="py-4"
                      >
                        Dashboard
                      </ListboxItem>

                      <ListboxItem
                        key="users"
                        startContent={<User size={22} />}
                        className="py-4"
                      >
                        Users
                      </ListboxItem>

                      <ListboxItem
                        key="products-admin"
                        startContent={<Package size={22} />}
                        className="py-4"
                      >
                        Products
                      </ListboxItem>

                      <ListboxItem
                        key="orders"
                        startContent={<ShoppingBag size={22} />}
                        className="py-4"
                      >
                        Orders
                      </ListboxItem>
                    </Listbox>
                  </>
                )}

                {/* AUTH */}
                <Divider className="my-4" />

                <Listbox
                  aria-label="Auth"
                  variant="flat"
                  onAction={(key) => {
                    if (key === "logout") handleLogout();
                    if (key === "login") router.push("/login");
                    onClose();
                  }}
                >
                  {user ? (
                    <ListboxItem
                      key="logout"
                      color="danger"
                      startContent={<LogOut size={22} />}
                      className="py-4"
                    >
                      Log Out
                    </ListboxItem>
                  ) : (
                    <ListboxItem
                      key="login"
                      startContent={<User size={22} />}
                      className="py-4"
                    >
                      Log In
                    </ListboxItem>
                  )}
                </Listbox>

              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}