import type { Metadata } from "next";
import { DM_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AlinSoft - Universal Code Converter",
  description: "Convert HTML, CSS, JavaScript, Python, EXE files and more with AI-powered conversion.",
  keywords: ["AlinSoft", "Code Converter", "Python", "HTML", "EXE", "Next.js", "PyQt5"],
  authors: [{ name: "AlinSoft Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AlinSoft",
    description: "Universal Code Converter & Transformer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${firaCode.variable} antialiased`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
