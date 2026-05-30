import type { Metadata } from "next";

import { QueryProvider } from "@/providers/QueryProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chat Challenge",
  description: "Doodle frontend engineer challenge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
