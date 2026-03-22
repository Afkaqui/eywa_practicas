import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EYWA - Plataforma de Orquestación Ecosistémica y Sostenibilidad",
    template: "%s | EYWA",
  },
  description:
    "EYWA conecta y orquesta los ecosistemas de gobierno, empresas, inversores y sociedad civil a través de una plataforma inteligente de gestión de datos para impulsar la sostenibilidad medible.",
  keywords: [
    "sostenibilidad",
    "ESG",
    "orquestación ecosistémica",
    "gestión de datos",
    "carbono",
    "certificación orgánica",
    "inversión sostenible",
    "plataforma ESG",
    "reporting ESG",
    "huella de carbono",
    "economía circular",
    "deep tech",
    "sustainability platform",
    "EYWA",
  ],
  authors: [{ name: "EYWA Platform" }],
  creator: "EYWA",
  publisher: "EYWA Platform",
  metadataBase: new URL("https://eywa.com"),
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "EYWA",
    title: "EYWA - Plataforma de Orquestación Ecosistémica y Sostenibilidad",
    description:
      "Conectamos gobierno, empresas e inversores en un único flujo de trabajo colaborativo basado en datos verificables para impulsar decisiones sostenibles.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "EYWA - Sustainability Platform",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "EYWA - Plataforma de Sostenibilidad",
    description:
      "Orquestación de ecosistemas a través de datos inteligentes para la sostenibilidad medible.",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "TU_CODIGO_DE_VERIFICACION_GOOGLE",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
