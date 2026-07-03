import "./globals.css";

export const metadata = { title: "CareerOS", description: "AI Career Operating System" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
