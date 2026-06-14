import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Igreja CRM",
  description: "Sistema de Gestão da Igreja",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}