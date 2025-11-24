// src/pages/barbero/clientes/[id].tsx

import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
// 🔑 IMPORTACIONES CLAVE PARA EVITAR ERRORES
import { FaPhone, FaBriefcase, FaArrowLeft, FaCut } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout'; 
import styles from '@/styles/ClientePerfil.module.css'; 

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
    total: number; 
    nom_bar: string; 
}

const BarberClientePerfilPage: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [cliente, setCliente] = useState<ClienteDetails | null>(null);
    const [historial, setHistorial] = useState<ServicioHistorial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/clientes/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setCliente(data.cliente);
                    setHistorial(data.historial.map((h: any) => ({ 
                        ...h, 
                        total: parseFloat(h.total) 
                    })));
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [id]);

    if (loading || !cliente) return (
        <BarberLayout>
            <p style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>Cargando perfil...</p>
        </BarberLayout>
    );

    const getInitials = (nombre: string, apellido: string) => (nombre[0] || '') + (apellido[0] || '');

    return (
        <BarberLayout>
            <Head><title>Perfil - {cliente.nom_clie}</title></Head>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                 
                 <button onClick={() => router.push('/barbero/clientes')} className={styles.backButton}>
                    <FaArrowLeft /> Volver a la lista
                </button>

                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar} style={{ backgroundColor: '#333', border: '2px solid var(--color-accent)' }}>
                        {getInitials(cliente.nom_clie, cliente.apell_clie)}
                    </div>
                    <div className={styles.profileInfo}>
                        <h1>{cliente.nom_clie} {cliente.apell_clie}</h1>
                        <p><FaPhone /> {cliente.tel_clie}</p>
                        <p><FaBriefcase /> {cliente.ocupacion} ({cliente.edad_clie} años)</p>
                    </div>
                    
                    {/* 🔑 BOTÓN QUE REDIRIGE A NUEVO SERVICIO */}
                    <button 
                        onClick={() => router.push(`/barbero/nuevo-servicio?clienteId=${cliente.id_clie}`)}
                        style={{ 
                            marginLeft: 'auto', 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'var(--color-background)',
                            border: 'none', padding: '10px 20px', borderRadius: '6px', 
                            fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <FaCut /> + Nuevo Servicio
                    </button>
                </div>

                <h2 className={styles.sectionTitle}>Historial de Servicios</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.historyTable}>
                        <thead>
                            <tr><th>Fecha</th><th>Servicio</th><th>Barbero</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            {historial.length > 0 ? (
                                historial.map((s, i) => (
                                    <tr key={i}>
                                        <td>{new Date(s.fecha).toLocaleDateString()}</td>
                                        <td>{s.tipo}</td>
                                        <td>{s.nom_bar}</td>
                                        <td>${s.total.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} style={{textAlign: 'center', padding: '20px', color: '#888'}}>Sin historial reciente.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </BarberLayout>
    );
};

export default BarberClientePerfilPage;