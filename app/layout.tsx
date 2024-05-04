import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { IBM_Plex_Serif, Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horizen Bank",
  description: "Horizen is a modern banking platform for everyone",
  icons: {
    icon: "/icons/logo.svg",
  },
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const ibmFlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, ibmFlexSerif.variable)}>{children}</body>
    </html>
  );
}

export default AppLayout;
