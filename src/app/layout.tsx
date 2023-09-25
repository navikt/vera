import type { Metadata } from 'next'
import VeraHeader from './veraHeader';
import "@navikt/ds-css";

export const metadata: Metadata = {
  title: 'Vera',
  description: 'Vera; versjonsoversikt',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <VeraHeader/>
        <main>{children}</main>
      </body>
    </html>
  )
}
