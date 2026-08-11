import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NontonGratis - Nonton Film Gratis Sub Indonesia",
  description: "Nonton film gratis dengan subtitle Bahasa Indonesia. Koleksi film terlengkap dari berbagai genre.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Block popup ads from embedded players */}
        <Script id="popup-blocker" strategy="beforeInteractive">{`
          (function() {
            var _open = window.open;
            window.open = function(url, name, features) {
              // Allow fullscreen and named targets that are same-origin, block everything else
              if (!url || url === '' || url === 'about:blank') return null;
              try {
                var u = new URL(url, window.location.href);
                if (u.origin === window.location.origin) return _open.apply(window, arguments);
              } catch(e) {}
              console.log('[popup-blocker] blocked:', url);
              return null;
            };
          })();
        `}</Script>
      </head>
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <SessionProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
