import React from "react";
import './globals.css';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({children}: RootLayoutProps) {
    return (
        <html lang="en" className="h-full">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any"/>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap"/>
                <title>Fretter - Minimalist Guitar Tab Editor</title>
                <meta name="description" content="A clean, minimalist guitar tab editor" />
            </head>
            <body className="h-full bg-neutral-50">
                {children}
            </body>
        </html>
    )
}
