import { Auth0Provider } from '../components/Auth0Provider';
import '../styles/globals.css'; // adjust path as needed

export const metadata = {
  title: 'Carbon Market Directory',
  description: 'Access to the carbon market directory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}
