import { useState, useEffect, useCallback } from 'react';

export interface Cliente {
    id_clie: number;
    nom_clie: string;
    apell_clie: string;
    tel_clie: string;
    email_clie: string;
    ocupacion: string;
    edad_clie: number; // 👈 NUEVO
    foto_base64?: string;
    nombre_barbero?: string; // 👈 Para ver quién lo atiende

}

export const useClientes = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. LISTAR (Centralizado)
    const fetchClientes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clientes');
            if (!res.ok) throw new Error('Error al cargar clientes');
            const data = await res.json();
            setClientes(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. CREAR (Centralizado)
    const createCliente = async (clienteData: any) => {
        try {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
            if (!res.ok) throw new Error('Error al crear cliente');
            await fetchClientes(); // Recargar lista automáticamente
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    // 3. ELIMINAR (Centralizado)
    const deleteCliente = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
        try {
            const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar');
            await fetchClientes(); // Recargar lista automáticamente
            return { success: true };
        } catch (err: any) {
            alert(err.message);
            return { success: false };
        }
    };

    // Cargar al montar
    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    return {
        clientes,
        loading,
        error,
        fetchClientes,
        createCliente,
        deleteCliente
    };
};