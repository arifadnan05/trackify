import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const Navbar = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return (
    <header className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-wide hover:opacity-90 transition-opacity"
        >
          Trackify
        </Link>
        <nav className="flex items-center gap-6">
          {token ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="bg-white text-pink-600 px-4 py-1.5 rounded-full font-medium text-sm shadow-sm hover:bg-pink-50 transition-all"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
