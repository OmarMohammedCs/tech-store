"use client";

import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import api from "../servise/api";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const userToken = new URLSearchParams(window.location.search).get("token") || "";

  const [hidden, setHidden] = useState(true);
  const [hiddenConfirm, setHiddenConfirm] = useState(true);
  let Icon = hidden ? Eye : EyeOff;
  let IconConfirm = hiddenConfirm ? Eye : EyeOff;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("Please enter both password fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.auth.resetPassword({ password, token: userToken })

      setMessage(res.data.message || "Password reset successfully");
      toast.success(res.data.message || "Password reset successfully");
      window.location.href = "/login";
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Something went wrong. Try again."
      );
      toast.error(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Toaster position="top-right" />
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={hidden ? "password" : "text"}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Icon className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500" onClick={() => setHidden(!hidden)} />
          </div>

          <div className="relative">
            <Input
              type={hiddenConfirm ? "password" : "text"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <IconConfirm className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500" onClick={() => setHiddenConfirm(!hiddenConfirm)} />
          </div>

          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="w-full bg-black dark:bg-gray-700 text-white rounded-lg p-2"
          >
            {loading ? "Saving..." : "Save New Password"}
          </Button>
        </form>

        {message && (
          <p className="mt-3 text-sm text-center text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
