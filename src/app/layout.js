import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import StoreElements from "../components/StoreElements";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Bike King | Pasión a Tope",
  description: "Tienda de bicicletas, repuestos, accesorios y servicio técnico especializado en Saravena, Arauca.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <Providers>
          <StoreElements>
            {children}
          </StoreElements>
        </Providers>
      </body>
    </html>
  );
}
