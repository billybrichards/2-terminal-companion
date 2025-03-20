import './globals.css';

export const metadata = {
  title: 'Carbon Market Directory',
  description: 'Directory of carbon market buyers and projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
