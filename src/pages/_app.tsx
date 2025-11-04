// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from '@/components/Layout'; 
import { useRouter } from 'next/router'; 
import { ThemeProvider } from "@/context/ThemeContext"; // ⬅️ 1. Importar

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isLoginPage = router.pathname === '/login'; 
    
    if (isLoginPage) {
        return <Component {...pageProps} />;
    }

    return (
        // 🔑 2. Envolver el Layout con el ThemeProvider
        <ThemeProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </ThemeProvider>
    );
}

export default MyApp;