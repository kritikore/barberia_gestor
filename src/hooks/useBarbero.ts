import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const useBarbero = () => {
    const [barbero, setBarbero] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // 1. Verificamos si hay sesión guardada
        const storedData = localStorage.getItem('barbero_data');
        const token = localStorage.getItem('token');

        if (!token || !storedData) {
            // Si falta algo, mandamos al login
            console.warn("No hay sesión válida, redirigiendo...");
            router.push('/login');
            setLoading(false);
            return;
        }

        try {
            // 2. Leemos los datos directamente del localStorage
            // Ya no dependemos del servidor ni de decodificar tokens raros
            const parsedUser = JSON.parse(storedData);
            
            // Aseguramos que tenga los campos mínimos para que no truene el dashboard
            if (!parsedUser.nom_bar) {
                // Si viene con otro nombre (ej. 'nombre'), lo ajustamos
                parsedUser.nom_bar = parsedUser.nombre || parsedUser.name || parsedUser.email;
            }
            if (!parsedUser.id_bar) {
                parsedUser.id_bar = parsedUser.id || 0;
            }

            setBarbero(parsedUser);
            setLoading(false);

        } catch (err) {
            console.error("Error al leer datos del barbero", err);
            setError("Los datos de sesión están corruptos. Por favor ingresa de nuevo.");
            localStorage.removeItem('token');
            localStorage.removeItem('barbero_data');
            setLoading(false);
        }

    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('barbero_data'); // Borramos los datos al salir
        setBarbero(null);
        router.push('/login');
    };

    const retry = () => {
        router.push('/login'); // En este caso, reintentar es volver a loguearse para guardar bien los datos
    };

    return { barbero, loading, error, logout, retry };
};