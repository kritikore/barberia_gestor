// src/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

import AdminLayout from "@/components/AdminLayout";
import BarberLayout from "@/components/BarberLayout";

export default function MyApp({ Component, pageProps }: AppProps) {
    const { pathname } = useRouter();

    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register");

    const isBarberPage = pathname.startsWith("/barbero");

    let content: React.ReactNode;

    if (isAuthPage) {
        content = <Component {...pageProps} />;
    } else if (isBarberPage) {
        content = (
            <BarberLayout>
                <Component {...pageProps} />
            </BarberLayout>
        );
    } else {
        content = (
            <AdminLayout>
                <Component {...pageProps} />
            </AdminLayout>
        );
    }

    return (
        <ThemeProvider>
            {content}
        </ThemeProvider>
    );
}
