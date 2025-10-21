import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus Atemporal - CRM Completo para Clínicas de Estética",
  description: "Gestão, Automação e IA em um só lugar. O CRM mais completo para clínicas de estética do Brasil.",
  keywords: "CRM, clínicas, estética, gestão, automação, IA, prontuários eletrônicos, whatsapp, leads",
  authors: [{ name: "Nexus Atemporal" }],
  openGraph: {
    title: "Nexus Atemporal - CRM Completo para Clínicas de Estética",
    description: "Gestão, Automação e IA em um só lugar",
    type: "website",
    url: "https://nexustemporal.com.br",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
