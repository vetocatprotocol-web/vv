import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "KARYO Admin",
  description: "KARYO OS admin interface",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
