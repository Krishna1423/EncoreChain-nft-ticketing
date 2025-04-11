"use client";
import "../app/globals.css";
import { WalletProvider } from "@/context/WalletContext";
import NavBar from "./NavBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main>{children}</main>
      </div>
    </WalletProvider>
  );
}
