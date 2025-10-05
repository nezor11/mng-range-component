import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mango Range Component",
  description: "Technical test for Mango",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <h1>Mango Range Component</h1>
          </div>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
