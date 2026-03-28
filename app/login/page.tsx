"use client";

import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { signIn, useSession } from "next-auth/react";
import api from "../servise/api";

export default function LoginPage() {
  const router = useRouter();
  const [hidden, setHidden] = useState(true);
  const { data: session } = useSession();
  const Icon = hidden ? EyeOff : Eye;

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

 
  useEffect(() => {
    document.title = "Login - TechStore";
  }, []);

 
useEffect(() => {
  if (!session) return; 

  const fetchToken = async () => {
    try {
      const res = await api.auth.googleLogin()
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/"); 
    } catch (error) {
      console.error("Failed to fetch JWT token:", error);
    }
  };

  fetchToken();
}, [session]); 
 
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.auth.login(loginData)

      if (response.data.success) {
        toast.success("Login successful!");

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        router.push("/");
        router.refresh();
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-black px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Login to continue
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value.trim() })
              }
              onKeyPress={handleKeyPress}
            />
            <div className="relative">
              <Input
                label="Password"
                type={hidden ? "password" : "text"}
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                onKeyPress={handleKeyPress}
              />
              <Icon
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setHidden(!hidden)}
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              isLoading={isLoading}
              isDisabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2 shadow-md transition-all duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
              </Link>
            </p>

            {/* Google Button */}
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

<Button
  onClick={async () => {
    try {
      const res = await signIn("google", { redirect: false });

      if (res?.ok) {
        const tokenRes = await api.auth.googleLogin();
        const data = tokenRes.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/");
      } else {
        console.error("Google login failed", res);
      }
    } catch (err) {
      console.error(err);
    }
  }}
  className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 shadow-md transition-all duration-200 flex items-center justify-center gap-2"
>
  <FcGoogle size={20} /> Continue with Google
</Button>
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
}