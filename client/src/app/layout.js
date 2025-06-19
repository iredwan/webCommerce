import { Poppins } from "next/font/google";
import "./globals.css";
import { Provider } from "./Provider";
import AppWrapper from "@/components/AppWrapper"; // client wrapper
import Toast from "../utils/toast";
import CustomTopLoader from "@/components/CustomTopLoader";
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
      <body className={`${poppins.className} antialiased bg-gray-50 dark:bg-gray-900`}>
        <Provider>
          <CustomTopLoader />
          <Toast />
          <AppWrapper>{children}</AppWrapper>
        </Provider>
      </body>
    </html>
  );
}
