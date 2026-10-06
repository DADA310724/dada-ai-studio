import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "DADA-AI",
  description: "Premium Gemini-powered AI workspace"
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="bn" suppressHydrationWarning><body>{children}</body></html>;
}
