// src/pages/clientes.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
// 🔑 CORRECCIÓN: ¡Eliminamos la importación duplicada de Sidebar!
// El Layout (en _app.tsx) ya lo incluye.
// import Sidebar from '@/components/Sidebar'; 

// Importamos la Interfaz y el Componente
import ClientesTable, { Cliente } from '@/components/ClientesTable'; 
import AddClientModal from '@/components/AddClientModal';
import { FaUsers } from 'react-icons/fa'; 
import layoutStyles from '@/styles/GlobalLayout.module.css'; 
import clientStyles from '@/styles/Clientes.module.css'; 

const ClientesPage: NextPage = () => {
    const moduleName = "Clientes"; 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClientes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/clientes'); 
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            
            const clientesMapeados = data.map((cli: any) => ({
                id_clie: cli.id_clie,
                nombre: `${cli.nom_clie} ${cli.apell_clie}`,
                telefono: cli.tel_clie,
                // Datos simulados (necesitaríamos JOINS con SERVICIO_REALIZADO)
                ultimaVisita: '2025-10-10', 
                totalServicios: 5,
                gastoTotal: 450.00
            }));
            setClientes(clientesMapeados);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleAddClient = () => setIsModalOpen(true);
    
    const handleClientAdded = () => {
        fetchClientes(); 
    };

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            {isModalOpen && (
                <AddClientModal 
                    onClose={() => setIsModalOpen(false)} 
                    onClientAdded={handleClientAdded}
                />
            )}
            
            {/* 🔑 CORRECCIÓN: Eliminamos el <div className={layoutStyles.layoutContainer}>
                y el <Sidebar ... /> porque _app.tsx y Layout.tsx ya lo hacen. */}
            
            <main className={layoutStyles.mainContent}> 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h1>
                        <FaUsers style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Gestión de Clientes
                    </h1>
                    <button 
                        onClick={handleAddClient} 
                        style={{ 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'var(--color-background)', 
                            border: 'none', 
                            padding: '10px 15px', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                       + Añadir Nuevo Cliente
                    </button>
                </div>
                
                {/* ... (Barra de Filtros) ... */}

                {loading && <p>Cargando clientes...</p>}
                {error && <p style={{color: 'var(--color-danger)'}}>{error}</p>}
                {!loading && !error && (
                    // 🔑 CORRECCIÓN: Pasamos la prop 'clientes' al componente
                    <ClientesTable clientes={clientes} /> 
                )}
            </main>
        </>
    );
};

export default ClientesPage;