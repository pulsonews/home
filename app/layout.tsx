import type { Metadata } from "next";
import { Archivo, Source_Serif_4, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AdSenseInit from "@/components/AdSenseInit";

const display = Archivo({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display"
});
const body = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body"
});
const ui = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui"
});

export const metadata: Metadata = {
  title: "Pulso Notícias — o pulso do que está acontecendo",
  description:
    "Portal de notícias em tempo real: Brasil, Mundo, Economia, Esportes, Tecnologia e Entretenimento, atualizado automaticamente."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${display.variable} ${body.variable} ${ui.variable} font-body bg-paper text-charcoal`}
        suppressHydrationWarning
      >
        {children}
        <AdSenseInit />
      </body>
    </html>
  );
}
