"use client";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import React from "react";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };
  return (
    <div>
      <button
        className="cursor-pointer"
        onClick={() => {
          handleLogout();
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
