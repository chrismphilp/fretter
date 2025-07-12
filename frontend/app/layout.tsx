import React from "react";
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

const jetbrains_mono = JetBrains_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
    title: 'Fretter - Minimalist Guitar Tab Editor',
    description: 'A clean, minimalist guitar tab editor',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({children}: RootLayoutProps) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrains_mono.variable} h-full`}>
            <body className="h-full bg-neutral-50 font-sans">
                {children}
            </body>
        </html>
    )
}
