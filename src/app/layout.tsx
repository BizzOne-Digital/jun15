import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Royal Garden Restaurant | Order Online",
  description:
    "Order Chinese cuisine online from Royal Garden Restaurant in Hinton, Alberta.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full w-full overflow-x-hidden`}
    >
      <body className="min-h-full w-full overflow-x-hidden font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
