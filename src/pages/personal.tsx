// src/pages/personal.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUserTie, FaPlus, FaTrash, FaEye, FaEdit } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Servicios.module.css';

interface Barbero {
    id_bar: number;
    nom_bar: string;
    apell_bar: string;
    tel_bar: string;
    email_bar: string;
    estado: string;
}

const PersonalPage: NextPage = () => {
    const router = useRouter();
    const [personal, setPersonal] = useState<Barbero[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPersonal = async () => {
        try {
            const res = await fetch('/api/personal');
            if (res.ok) setPersonal(await res.json());
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPersonal(); }, []);

    // Placeholder para editar (Aquí abrirías un modal o irías a una página de edición)
    const handleEdit = (barbero: Barbero) => {
        alert(`Editar datos de: ${barbero.nom_bar} (Funcionalidad pendiente de conectar al Modal de Edición)`);
        // Aquí podrías poner: setIsEditModalOpen(true); setSelectedBarbero(barbero);
    };

    const handleDelete = async (id: number) => {
        if(!confirm("¿Estás seguro de dar de baja a este barbero?\n\nNota: Su historial de ventas se conservará, pero ya no tendrá acceso al sistema.")) return;
        
        try {
            const response = await fetch(`/api/personal/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar');
            }

            alert("✅ Barbero dado de baja exitosamente.");
            
            // Recargamos la lista para ver el cambio de estado
            fetchPersonal();

        } catch (error) {
            alert("Hubo un error al intentar dar de baja.");
        }
    };

    return (
        <>
            <Head><title>Gestión de Personal</title></Head>
            
            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaUserTie style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Equipo de Barberos
                    </h1>
                    <button 
                        onClick={() => router.push('/register')} 
                        style={{ 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'var(--color-background)', 
                            border: 'none', 
                            padding: '10px 15px', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', gap: 5
                        }}
                    >
                       <FaPlus /> Nuevo Barbero
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Estado</th>
                                <th style={{textAlign: 'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{textAlign: 'center', padding: 20}}>Cargando equipo...</td></tr>
                            ) : (
                                personal.map((p) => (
                                    <tr key={p.id_bar}>
                                        <td style={{fontWeight: 'bold', color: 'white'}}>
                                            {p.nom_bar} {p.apell_bar}
                                        </td>
                                        <td>{p.tel_bar}</td>
                                        <td>{p.email_bar}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em',
                                                backgroundColor: p.estado === 'Activo' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                                                color: p.estado === 'Activo' ? '#28a745' : '#DC3545',
                                                border: p.estado === 'Activo' ? '1px solid #28a745' : '1px solid #DC3545'
                                            }}>
                                                {p.estado}
                                            </span>
                                        </td>
                                        
                                        <td className={styles.actionCell} style={{justifyContent: 'center', gap: '10px'}}>
                                            {/* 1. VER PERFIL E INSUMOS */}
                                            <button 
                                                onClick={() => router.push(`/personal/${p.id_bar}`)}
                                                className={styles.actionButton} 
                                                title="Gestionar Insumos / Ver Perfil"
                                                style={{color: '#0D6EFD', border: '1px solid #0D6EFD'}}
                                            >
                                                <FaEye /> Ver Perfil
                                            </button>

                                            {/* 2. 🔑 EDITAR DATOS (RESTAURADO) */}
                                            <button 
                                                onClick={() => handleEdit(p)}
                                                className={styles.actionButton} 
                                                title="Editar Datos Personales"
                                            >
                                                <FaEdit />
                                            </button>

                                            {/* 3. ELIMINAR */}
                                            <button 
                                                onClick={() => handleDelete(p.id_bar)}
                                                className={`${styles.actionButton} ${styles.deleteIcon}`} 
                                                title="Eliminar"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default PersonalPage;