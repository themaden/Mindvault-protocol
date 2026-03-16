import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MindVault Protocol",
  description: "Show the Proof, Hide the Logic. Powered by NDAI and ASC.",
  themeColor: "#03080A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistMono.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {/* Ambient scan line effect */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,255,135,0.4) 40%, rgba(201,168,76,0.3) 60%, transparent 100%)",
            zIndex: 9999,
            pointerEvents: "none",
            animation: "scan-line 8s linear infinite",
            opacity: 0.5,
          }}
        />
        {children}
      </body>
    </html>
  );
}