import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import VideoModal from "@/components/Hero/VideoModal";
import Context from "@/Helper/Context";

// This was declared but never exported, so Next.js ignored it and every page
// shipped with the framework's default title.
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
    <html lang="en" suppressHydrationWarning>
      {/* The wrapper used to hardcode `bg-background text-foreground`, which pinned the
          whole app to the dark palette no matter what the theme provider said. */}
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Context>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <div className="flex flex-1">
                  <Sidebar />
                  {/* The sidebar is hidden below `md`, so the offset that clears
                      it has to be too — it was an unconditional `ml-40`. */}
                  <main className="flex-1 pt-20 md:ml-44">{children}</main>
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
