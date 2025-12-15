// src/pages/clientes.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { FaUsers, FaPlus, FaTrash, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import AddClientModal from '@/components/ClientModal';
import ClientDetailModal from '@/components/ClientDetailModal'; // 👈 Importamos el nuevo modal de detalle
import styles from '@/styles/Servicios.module.css'; // 👈 Importamos los estilos para corregir el error
import ClientModal from '@/components/ClientModal';

// Interfaz completa del Cliente
interface Cliente {
    id_clie: number;
    nom_clie: string;
    apell_clie: string;
    tel_clie: string;
    email_clie: string;
    ocupacion: string;
    edad_clie: number;
    foto_base64?: string;
    nombre_barbero?: string; // Para saber quién lo atiende
}

const ClientesPage: NextPage = () => {
    // Estados
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para Modales
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null); // 👈 Controla qué cliente se está viendo en detalle

    // 1. Función para Cargar Clientes (Esto corrige el error "fetchClientes not found")
    const fetchClientes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clientes');
            if (res.ok) {
                const data = await res.json();
                setClientes(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        fetchClientes();
    }, []);

    // Función para Eliminar Cliente
    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Evita que se abra el modal de detalle al dar click en borrar
        if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
        try {
            const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Cliente eliminado");
                fetchClientes();
            } else {
                alert("Error al eliminar");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Head><title>Cartera de Clientes</title></Head>

            {/* Modal para AGREGAR Nuevo Cliente */}
            {isAddModalOpen && (
                <ClientModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSuccess={fetchClientes} 
                />
            )}

            {/* Modal para VER DETALLE / EDITAR / HISTORIAL */}
            {selectedClientId && (
                <ClientDetailModal 
                    clientId={selectedClientId}
                    onClose={() => setSelectedClientId(null)}
                    onUpdateSuccess={fetchClientes} // Al editar, recarga la lista
                />
            )}

            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaUsers style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Cartera de Clientes
                    </h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        style={{ 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'black', 
                            border: 'none', 
                            padding: '10px 20px', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '1rem'
                        }}
                    >
                       <FaPlus /> Nuevo Cliente
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.serviciosTable}>
                        <thead>
                            <tr>
                                <th style={{width: '80px', textAlign: 'center'}}>Foto</th>
                                <th>Nombre Completo</th>
                                <th>Teléfono</th>
                                <th>Cartera de</th> {/* Nueva Columna */}
                                <th>Ocupación</th>
                                <th style={{textAlign: 'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px', color: '#aaa'}}>Cargando clientes...</td></tr>
                            ) : (
                                clientes.map((cliente) => (
                                    <tr 
                                        key={cliente.id_clie}
                                        onClick={() => setSelectedClientId(cliente.id_clie)} // 👈 AQUÍ SE ABRE EL SUPER PERFIL
                                        style={{cursor: 'pointer', transition: 'background 0.2s'}}
                                        className="hover:bg-gray-800" // Clase opcional si usas tailwind, si no el CSS module lo maneja
                                    >
                                        
                                        {/* FOTO */}
                                        <td style={{textAlign: 'center'}}>
                                            {cliente.foto_base64 ? (
                                                <img 
                                                    src={`data:image/jpeg;base64,${cliente.foto_base64}`} 
                                                    alt="Avatar" 
                                                    style={{
                                                        width: '45px', 
                                                        height: '45px', 
                                                        borderRadius: '50%', 
                                                        objectFit: 'cover', 
                                                        border: '2px solid var(--color-accent)'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '45px', 
                                                    height: '45px', 
                                                    borderRadius: '50%', 
                                                    backgroundColor: '#333', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    margin: '0 auto',
                                                    border: '1px solid #555'
                                                }}>
                                                    <FaUser size={20} color="#666" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Nombre */}
                                        <td>
                                            <div style={{fontWeight: 'bold', color: 'white', fontSize: '1.05em'}}>
                                                {cliente.nom_clie} {cliente.apell_clie}
                                            </div>
                                        </td>

                                        {/* Teléfono */}
                                        <td>
                                            <div style={{display:'flex', alignItems:'center', gap:8, color: '#ccc'}}>
                                                <FaPhone size={12} color="var(--color-accent)"/>
                                                {cliente.tel_clie}
                                            </div>
                                        </td>

                                       {/* Barbero Asignado (Cartera) */}
                                        <td style={{ color: cliente.nombre_barbero ? 'white' : '#888' }}>
                                            {cliente.nombre_barbero ? (
                                                <span style={{background:'#0D6EFD', color:'white', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8em'}}>
                                                    {cliente.nombre_barbero}
                                                </span>
                                            ) : (
                                                <span style={{color: '#888', fontStyle: 'italic'}}>Sin asignar</span>
                                            )}
                                        </td> 

                                        {/* Ocupación */}
                                        <td style={{color: '#aaa'}}>
                                            {cliente.ocupacion || '-'}
                                        </td>

                                        {/* Acciones */}
                                        <td className={styles.actionCell}>
                                            <button 
                                                className={styles.actionButton} 
                                                style={{color: '#dc3545', border: '1px solid #dc3545'}} 
                                                onClick={(e) => handleDelete(e, cliente.id_clie)} 
                                                title="Eliminar Cliente"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && clientes.length === 0 && (
                                <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px', color: '#666'}}>No hay clientes registrados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default ClientesPage;