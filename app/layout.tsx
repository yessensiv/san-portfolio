import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import 'lenis/dist/lenis.css';
export const metadata: Metadata = {
  title: 'SAN',
  description: 'SAN — web, mobile and AI projects.',
  icons: { icon: '/assets/mark.svg' },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head>
    <link rel="stylesheet" href="/style.css" />
    <link rel="stylesheet" href="/reference.css" />
    <link rel="stylesheet" href="/motion.css" />
  </head><body>{children}</body></html>;
}
