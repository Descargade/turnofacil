import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TurnoFácil - Gestión de Turnos Profesional",
  description:
    "Plataforma SaaS para la gestión inteligente de turnos en peluquerías, estudios de tatuaje, consultorios odontológicos y más. Reservas online, recordatorios automáticos y reportes detallados.",
  keywords: [
    "gestión de turnos",
    "reservas online",
    "peluquería",
    "barbería",
    "tatuaje",
    "odontología",
    "saas",
    "agenda profesional",
  ],
  openGraph: {
    title: "TurnoFácil - Gestión de Turnos Profesional",
    description:
      "Administrá tus turnos de forma inteligente. Reservas online 24/7, recordatorios automáticos y métricas en tiempo real.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
