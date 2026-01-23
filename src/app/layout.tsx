import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Challenge Tracker",
  description: "Track and manage challenges with teams and leaderboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center px-4">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Challenge Tracker</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/challenges"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Challenges
              </Link>
              <Link
                href="/teams"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Teams
              </Link>
              <Link
                href="/users"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Users
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
