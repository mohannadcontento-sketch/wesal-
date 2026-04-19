import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "وصال - رفيقك الذكي للصحة النفسية",
  description: "منصة صحة نفسية مجتمعية آمنة للمستخدم العربي. حيث يلتقي الوعي بالرعاية، والذكاء الاصطناعي بالدعم الإنساني.",
  keywords: ["وصال", "صحة نفسية", "دعم نفسي", "مجتمع", "عربي"],
  authors: [{ name: "Wesal Team" }],
  icons: {
    icon: "/wesal-logo.png",
  },
  openGraph: {
    title: "وصال - Wesal",
    description: "رفيقك الذكي للصحة النفسية الآمنة",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
