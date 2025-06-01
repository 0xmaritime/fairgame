import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import Providers from "@/components/Providers";

// Removed static metadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
