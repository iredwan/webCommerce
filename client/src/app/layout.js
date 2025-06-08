import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeApplier from "@/components/ThemeApplier";
import { Provider } from "./Provider";
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata = {
  title: "Web Commerce",
  description: "Web Commerce is a platform for buying and selling products online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <Provider>
        <ThemeApplier />
        <Navbar />
        {children}
        <Footer />
        </Provider>
      </body>
    </html>
  );
}
