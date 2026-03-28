"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Input,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from "@heroui/react";
import { usePathname } from "next/navigation";
import MenuComponent from "./leftMenu";
import { ShoppingBagIcon } from "lucide-react";
import { ThemeSwitch } from "./theme-switch";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminMenu from "./adminMenu";
import { signOut } from "next-auth/react";
import api from "@/app/servise/api";

export const SearchIcon = ({ size = 24, strokeWidth = 1.5, width, height, ...props }: { size?: number; strokeWidth?: number; width?: number; height?: number;[key: string]: any }) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={height || size}
      role="presentation"
      viewBox="0 0 24 24"
      width={width || size}
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default function NavbarComponent() {
  const pathname = usePathname();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [notifications, setNotifications] = useState<Array<{ _id: number; title: string; description: string }>>([]);
  const [updateNotes, setUpdateNotes] = useState(0);
  const [user, setUser] = useState<{ id: string; name: string; email: string, userName: string, role: string,avatar:string } | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsData, setSearchResultsData] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResultsData([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/products/search", {
          params: { query: searchQuery },
        });
        setSearchResultsData(res.data || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResultsData([]);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

const fetchNotifications = async () => {
  const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
  if (!userLocal?.id) return;

  const data = await api.notifications.getAll(userLocal.id);
  setNotifications(data.data);
};

  useEffect(() => {
  console.log("fetch notifications");
  fetchNotifications();
}, [updateNotes]);

  const links = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Favorites", href: "/favorites" },
  ];

const handleLogOut = async () => {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  await api.auth.logout();

  await signOut({
    callbackUrl: "/login",
  });

  setUser(null);
};

  if (!isMounted) {
    return (
      <Navbar isBordered>
        <NavbarContent justify="start">
          <NavbarBrand>
            <ShoppingBagIcon />
            <p className="hidden sm:block font-bold text-inherit">ACME</p>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent as="div" className="items-center" justify="end">
          <div className="w-40 md:w-72 h-10 bg-default-400/20 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-default-400/20 rounded-full animate-pulse" />
          <div className="w-8 h-8 bg-default-400/20 rounded-full animate-pulse ml-2" />
        </NavbarContent>
      </Navbar>
    );
  }

  return (
    <Navbar isBordered>
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" className="font-bold text-xl text-white">TECH <span className="hidden md:block">STORE</span></Link>
        </NavbarBrand>

        <NavbarContent className="hidden md:flex gap-3">
          {links.map((link, index) => (
            <NavbarItem key={index}>
              <Link
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${pathname === link.href
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
              >
                {link.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      </NavbarContent>

      <NavbarContent as="div" className="items-center relative" justify="end">
        <Input
          classNames={{
            base: "w-40 md:w-72 h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper:
              "h-full font-normal bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder="Type to search..."
          size="sm"
          startContent={<SearchIcon size={18} />}
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchResults(e.target.value.length > 0);
          }}
          onFocus={() => {
            if (searchQuery.length > 0) setShowSearchResults(true);
          }}
          onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        />

        {showSearchResults && (
          <div className="absolute top-14 right-14 sm:right-24 w-[90%] sm:w-[55%] max-w-md px-3 py-2 rounded-xl bg-white dark:bg-gray-900 shadow-2xl z-50">
            {searchResultsData.length === 0 ? (
              <p className="text-sm text-gray-500">No results found</p>
            ) : (
              searchResultsData.map((product, i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg mb-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                 <Link href={`/products/${product.slug}`} className="flex items-center gap-3">
                  <div className="flex gap-4 items-start">
                    <Image
                      src={product.images[0] || "/product.jpg"}
                      alt={product.name}
                      width={70}
                      height={70}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="font-semibold text-[11px] md:text-[13px] text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                 </Link>
                </div>
              ))
            )}
          </div>
        )}

        <ThemeSwitch />

        {
          user ? (
        <><Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform hidden md:block"
                  color="secondary"
                  size="sm"
                  src={user?.avatar || '/person.png'}

                  />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" href={`/u/${user?.userName}`} className="h-14 gap-2">
                  <div>
                    <p className="font-semibold">Signed in as</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </DropdownItem>
                <DropdownItem key="notifications" onPress={onOpen} onClick={() => setUpdateNotes((prev) => prev + 1)}>
                  Notifications
                </DropdownItem>
                <DropdownItem key="shopping-cart" href="/shopping-cart">
                  Shopping Cart
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={handleLogOut}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Modal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  placement="center"
  classNames={{
    base: "mx-2 w-[95%] md:w-[500px]",
    backdrop: "z-[9998]",
    wrapper: "z-[9999]",
  }}
>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">
          Notifications
        </ModalHeader>

        <ModalBody className="max-h-[60vh] overflow-y-auto">
          {notifications?.length === 0 ? (
            <p className="text-sm text-gray-500">
              No new notifications
            </p>
          ) : (
            notifications.map((note) => (
              <div
                key={note._id}
                className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <p className="font-semibold">{note.title}</p>
                <p className="text-sm text-gray-500">
                  {note.description}
                </p>
              </div>
            ))
          )}
        </ModalBody>

        <ModalFooter className="flex justify-end gap-2">
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>
              </>) : (

          <Link href="/login" className="font-bold bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors hidden md:block">
            Log In
          </Link>

        )}

        <div className="md:hidden">
          <MenuComponent user={user} setUpdateNotes={setUpdateNotes} updateNotes={updateNotes}  />
        </div>

        {user?.role === 'admin' && (
          <div className="hidden md:block">
            <AdminMenu />
          </div>
        )}
      </NavbarContent>
    </Navbar>
  );
}
