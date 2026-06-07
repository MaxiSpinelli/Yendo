import type { Metadata } from "next";
import "./globals.css";
import SplashScreen from "@/components/ui/SplashScreen";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Yendo — Tu viaje en un solo lugar",
  description: "Centralizá vuelos, alojamientos y actividades. Compartilo con quienes viajan con vos.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Yendo — Tu viaje en un solo lugar",
    description: "Centralizá vuelos, alojamientos y actividades. Compartilo con quienes viajan con vos.",
    siteName: "Yendo",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://yendo.app"}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "Yendo — Tu viaje en un solo lugar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yendo — Tu viaje en un solo lugar",
    description: "Centralizá vuelos, alojamientos y actividades. Compartilo con quienes viajan con vos.",
  },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1a1714" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Yendo" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen">
        <SplashScreen />
        {children}
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
