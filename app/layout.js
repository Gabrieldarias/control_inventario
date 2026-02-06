import "./globals.css";

export const metadata = {
  title: "Gestion Comercial",
  description: "Panel administrativo para ventas e inventario",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
