"use client";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AccountProvider } from "@/components/hooks/AccountProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AccountProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AccountProvider>
      </body>
    </html>
  );
}
