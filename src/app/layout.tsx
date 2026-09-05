import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import VideoModal from "@/components/Hero/VideoModal";
import Context from "@/Helper/Context";

// Self-hosted by next/font: no render-blocking request to Google, and no
// layout shift, since the fallback metrics are matched at build time.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "YouTube Learn",
    template: "%s · YouTube Learn",
  },
  description:
    "Discover and track educational videos from YouTube, without the noise.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Context>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <div className="flex flex-1">
                  <Sidebar />
                  <main className="flex-1 pt-20 md:ml-64">{children}</main>
                </div>
                <VideoModal />
              </div>
              <Toaster />
            </Context>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
