// src/pages/clientes/[id].tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import layoutStyles from '@/styles/GlobalLayout.module.css'; 
import styles from '@/styles/ClientePerfil.module.css'; 
import { FaUser, FaPhone, FaBriefcase, FaArrowLeft } from 'react-icons/fa';

// Definición de tipos de datos (basados en la API)
interface ClienteDetails {
    id_clie: number;
    nom_clie: string;
    apell_clie: string;
    tel_clie: string;
    edad_clie: number;
    ocupacion: string;
}
interface ServicioHistorial {
    fecha: string; 
    tipo: string;
    total: number; // ⬅️ 🔑 CORRECCIÓN: Cambiado de 'string' a 'number'
    nom_bar: string;
}

const ClientePerfilPage: NextPage = () => {
    const router = useRouter();
    const { id } = router.query; 

    const [cliente, setCliente] = useState<ClienteDetails | null>(null);
    const [historial, setHistorial] = useState<ServicioHistorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return; 
        
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/clientes/${id}`);
                if (!response.ok) {
                    throw new Error('No se pudo encontrar el cliente');
                }
                const data = await response.json();
                
                setCliente(data.cliente);
                // Mapeamos los datos de la DB
                setHistorial(data.historial.map((h: any) => ({
                    ...h,
                    total: parseFloat(h.total) // Convertimos a número
                })));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]); 

    if (loading) {
        return <main className={layoutStyles.mainContent}><p className={styles.loading}>Cargando perfil...</p></main>;
    }
    if (error) {
        return <main className={layoutStyles.mainContent}><p className={styles.error}>{error}</p></main>;
    }
    if (!cliente) {
        return <main className={layoutStyles.mainContent}><p className={styles.error}>Cliente no encontrado.</p></main>;
    }
    
    const getInitials = (nombre: string, apellido: string) => {
        return (nombre[0] || '') + (apellido[0] || '');
    };

    return (
        <>
            <Head>
                <title>Perfil de {cliente.nom_clie} {cliente.apell_clie}</title>
            </Head>
            
            {/* Asumimos que _app.tsx aplica el Layout/Sidebar */}
            <main className={layoutStyles.mainContent}>
                
                <button onClick={() => router.push('/clientes')} className={styles.backButton}>
                    <FaArrowLeft /> Volver al listado
                </button>

                {/* Sección 1: Cabecera del Perfil */}
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                        {getInitials(cliente.nom_clie, cliente.apell_clie)}
                    </div>
                    <div className={styles.profileInfo}>
                        <h1>{cliente.nom_clie} {cliente.apell_clie}</h1>
                        <p>
                            <FaPhone /> {cliente.tel_clie} | <FaBriefcase /> {cliente.ocupacion} | {cliente.edad_clie} años
                        </p>
                    </div>
                </div>

                {/* Sección 2: Historial de Servicios */}
                <h2 className={styles.sectionTitle}>Historial de Servicios</h2>
                <table className={styles.historyTable}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Servicio</th>
                            <th>Barbero</th>
                            <th>Total Pagado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.length > 0 ? (
                            historial.map((servicio, index) => (
                                <tr key={index}>
                                    <td>{new Date(servicio.fecha).toLocaleDateString()}</td>
                                    <td>{servicio.tipo}</td>
                                    <td>{servicio.nom_bar}</td>
                                    {/* 🔑 AHORA ES VÁLIDO: 'servicio.total' es 'number' */}
                                    <td>${servicio.total.toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center' }}>Este cliente aún no tiene servicios registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>
        </>
    );
};

export default ClientePerfilPage;