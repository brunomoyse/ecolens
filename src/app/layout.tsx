'use client';

// import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MapProvider } from '@/context/map-context';
import React from "react";

const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'EcoLens',
//   description: 'EcoLens is a platform for data visualization.',
// }

export default function RootLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <MapProvider>
                    {children}
                </MapProvider>
            </body>
        </html>
    )
}
