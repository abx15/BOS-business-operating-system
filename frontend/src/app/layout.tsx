import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/client-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "BOS | The Future of Business Operating Systems",
    template: "%s | BOS"
  },
  description: "BOS is an immersive neural operating system for elite enterprises, standardizing global business orchestration through cinematic engineering and ultra-low latency sync.",
  keywords: ["BOS", "Business OS", "Enterprise SaaS", "Neural Sync", "Quantum Analytics", "Fintech Dashboard", "Supply Chain Management"],
  authors: [{ name: "Arun Kumar Bind" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/assets/icons/favicon.png",
    apple: "/assets/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bos.arunkumar.dev",
    siteName: "BOS Protocol",
    title: "BOS | The Future of Business Operating Systems",
    description: "Architecting the future of global commerce with neural-sync technology and cinematic orchestration.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
        width: 1200,
        height: 630,
        alt: "BOS Protocol Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BOS | The Future of Business Operating Systems",
    description: "Next-gen enterprise orchestration with zero-latency neural synchronization.",
    images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
