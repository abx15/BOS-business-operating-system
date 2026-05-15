import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/client-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BOS - Business Operating System",
  description: "Next-gen SaaS Dashboard",
  icons: {
    icon: "/assets/icons/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
