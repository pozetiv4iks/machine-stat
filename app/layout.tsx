import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import LoadingScreen from "./components/LoadingScreen";
import TelegramUserInitializer from "./components/TelegramUserInitializer";
import AccessGuard from "./components/AccessGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Machine Stat",
  description: "Machine Stat Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <TelegramUserInitializer />
        <LoadingScreen />
        <AccessGuard>
          <main>{children}</main>
          <Navigation />
        </AccessGuard>
      </body>
    </html>
  );
}
