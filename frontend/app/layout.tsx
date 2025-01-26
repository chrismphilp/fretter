import React from "react";

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({children}: RootLayoutProps) {
    return (
        <>
            <link rel="icon" href="/favicon.ico" sizes="any"/>
            <html lang="en">
            <body>{children}</body>
            </html>
        </>
    )
}
