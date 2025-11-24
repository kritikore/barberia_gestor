// pages/_app.tsx - CORREGIDO

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from 'next/router'; 
import { ThemeProvider } from "@/context/ThemeContext";

// 🔑 CORRECCIÓN: Importamos desde 'AdminLayout', no 'Layout'
import AdminLayout from '@/components/AdminLayout'; 
import BarberLayout from '@/components/BarberLayout'; 

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    // 1. Rutas sin ningún Layout (Login, Registro)
    if (router.pathname === '/login' || router.pathname === '/register') {
        return (
             <ThemeProvider>
                <Component {...pageProps} />
             </ThemeProvider>
        );
    }

    // 2. Rutas del Barbero (Empiezan con /barbero)
    if (router.pathname.startsWith('/barbero')) {
        return (
            <ThemeProvider>
                <BarberLayout>
                    <Component {...pageProps} />
                </BarberLayout>
            </ThemeProvider>
        );
    }

    // 3. Rutas de Administrador (Por defecto)
    return (
        <ThemeProvider>
            <AdminLayout>
                <Component {...pageProps} />
            </AdminLayout>
        </ThemeProvider>
    );
}

export default MyApp;