import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout"; // Import the new Layout component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fair Game Price Index",
  description: "Game reviews with fair price recommendations instead of arbitrary scores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>{children}</Layout> {/* Use the new Layout component */}
      </body>
    </html>
  );
}
