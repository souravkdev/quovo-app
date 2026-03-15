import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import AppLayout from "@/components/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quovo — Professional project briefs in seconds",
  description: "Turn any client message into a signed project brief. Stop scope creep before it starts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}