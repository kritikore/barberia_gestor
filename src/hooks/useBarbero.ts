import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 🔒 CAMBIA ESTO CADA VEZ QUE HAGAS UN CAMBIO CRÍTICO EN LA ESTRUCTURA DE USUARIO
const CURRENT_APP_VERSION = 'v1.0_produccion'; 

export const useBarbero = () => {
    const [barbero, setBarbero] = useState<{ id_bar: number; nom_bar: string; apell_bar?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 1. REVISIÓN DE VERSIÓN (La parte nueva)
        const storedVersion = localStorage.getItem('app_version');

        if (storedVersion !== CURRENT_APP_VERSION) {
            console.warn("Versión antigua detectada. Limpiando caché...");
            // Si la versión no coincide, borramos TODO para evitar errores
            localStorage.clear(); 
            localStorage.setItem('app_version', CURRENT_APP_VERSION); // Guardamos la nueva
            setBarbero(null);
            setLoading(false);
            // Opcional: router.push('/'); // Si quieres forzar que vayan al login
            return;
        }

        // 2. LECTURA NORMAL DE USUARIO
        const storedUser = localStorage.getItem('usuario_activo');

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                // Validación extra: Que no sea el ID 11 prohibido o corrupto
                if (user && user.id_bar && user.id_bar !== 11) {
                    setBarbero(user);
                } else {
                    console.error("Usuario inválido o de prueba detectado.");
                    localStorage.removeItem('usuario_activo');
                    setBarbero(null);
                }
            } catch (error) {
                console.error("Error recuperando sesión:", error);
                localStorage.removeItem('usuario_activo');
                setBarbero(null);
            }
        } else {
            setBarbero(null);
        }
        
        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('usuario_activo');
        setBarbero(null);
        router.push('/');
    };

    return { barbero, loading, logout };
};