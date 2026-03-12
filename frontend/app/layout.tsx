import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chat Assistant",
  description: "AI chat assistant with PDF support powered by LangChain & Ollama",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-chat-bg text-chat-text h-screen flex antialiased overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
