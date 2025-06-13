import './globals.css';

// Minimal metadata for debugging
export const metadata = {
  title: 'ClipsCommerce Debugging',
  description: 'Currently debugging layout and build issues.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // Assuming React is globally available or correctly configured by Next.js
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Minimal head for now */}
      </head>
      <body>
        <div>Hello from Minimal Layout!</div> {/* Added for visual confirmation */}
        {children}
      </body>
    </html>
  );
}
