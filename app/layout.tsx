import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sondage réunion mariage",
  description: "Merci d'indiquer votre présence à la réunion d'organisation du mariage.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
