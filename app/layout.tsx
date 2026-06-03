import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yendo — Tu viaje en un solo lugar",
  description:
    "Centralizá vuelos, alojamientos y actividades. Compartilo con quienes viajan con vos.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}