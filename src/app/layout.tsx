import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import VideoModal from "@/components/Hero/VideoModal";
import  Context  from "@/Helper/Context";

const metadata: Metadata = {
  title: "YouTube Learn",
  description: "Learn from educational videos on YouTube Learn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          ><Context>
            <div className="flex flex-col min-h-screen bg-black text-white">
              <Navbar />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 ml-40 pt-16 pr-1 relative">
                  {children}
                </main>
              </div>
              <VideoModal />
            </div>
            </Context>
          </ThemeProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
