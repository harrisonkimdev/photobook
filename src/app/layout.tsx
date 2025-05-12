import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import { ToastProvider } from "@/app/(components)/ToastContext";
import { ThemeProvider } from "@/app/(components)/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "PhotoBook - Share Your Memories",
  description: "A beautiful way to share and preserve your photo memories with friends and family.",
  keywords: ["photo", "album", "memories", "share", "photobook"],
  authors: [{ name: "Harrison Kim" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#212529" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable}`}>
      <body className="min-h-screen bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-50 transition-colors duration-300">
        <ThemeProvider>
          <ToastProvider>
            <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
              {children}
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
