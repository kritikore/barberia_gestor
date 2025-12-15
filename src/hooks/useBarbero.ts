import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const useBarbero = () => {
    const router = useRouter();
    const [barbero, setBarbero] = useState<any>(null); // Inicia en NULL, no en un objeto con ID 11
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Buscamos la sesión guardada
        const storedUser = localStorage.getItem('usuario_activo');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                
                // Validación extra: Asegurarnos que tiene ID
                if (parsedUser && parsedUser.id_bar) {
                    setBarbero(parsedUser);
                } else {
                    // Si el objeto está corrupto, lo borramos
                    localStorage.removeItem('usuario_activo');
                    setBarbero(null);
                }
            } catch (e) {
                console.error("Error al leer sesión:", e);
                localStorage.removeItem('usuario_activo');
            }
        } else {
            // Si no hay usuario, redirigimos al login (Opcional, depende de tu lógica)
            // router.push('/'); 
        }
        
        setLoading(false);
    }, []); // El array vacío asegura que esto corra solo una vez al cargar/refrescar

    return { barbero, loading };
};
