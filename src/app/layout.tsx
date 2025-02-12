import type { Metadata } from "next";
import "./globals.css";
import Context from "@/Helper/Context";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "YouTube Learn",
  description: "Watch educational and informative videos on YouTube Learn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Context>{children}</Context>
          </ThemeProvider>
        </Providers>
        <Toaster/>
      </body>
    </html>
  );
}
