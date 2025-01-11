import React from "react";

export default function RootLayout({children,}: { children: React.ReactNode }) {
    return (
        <>
            <link rel="icon" href="/favicon.ico" sizes="any"/>
            <html lang="en">
            <body>{children}</body>
            </html>
        </>
    )
}
