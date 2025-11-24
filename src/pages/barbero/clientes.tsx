// src/pages/barbero/clientes.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaUsers, FaSearch, FaArrowLeft } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout'; // Layout del Barbero
import ClientCard, { Cliente } from '@/components/ClientCard';

const ConsultarClientesBarbero: NextPage = () => {
    const router = useRouter();
    
    // Estados
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Cargar clientes desde la API
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await fetch('/api/clientes');
                if (!response.ok) throw new Error('Error al cargar');
                const data = await response.json();
                setClientes(data);
                setFilteredClientes(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchClientes();
    }, []);

    // Lógica de búsqueda
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = clientes.filter(c => 
            c.nom_clie.toLowerCase().includes(term) || 
            c.apell_clie.toLowerCase().includes(term) ||
            c.tel_clie.includes(term)
        );
        setFilteredClientes(filtered);
    }, [searchTerm, clientes]);

    return (
        <BarberLayout>
            <Head><title>Consultar Clientes - Barbero</title></Head>

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Encabezado con Botón de Volver */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button onClick={() => router.push('/barbero/dashboard')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2em' }}>
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '2em', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text)' }}>
                        <FaUsers style={{ color: 'var(--color-accent)' }} /> 
                        Cartera de Clientes
                    </h1>
                </div>

                {/* Barra de Estadísticas (Simulando el diseño de la imagen) */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '15px', 
                    marginBottom: '30px' 
                }}>
                    <div style={{ backgroundColor: 'var(--color-card)', padding: '15px', borderRadius: '8px', border: '1px solid #444', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '2em', color: 'var(--color-text)' }}>{clientes.length}</h3>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#aaa' }}>Total Clientes</p>
                    </div>
                    <div style={{ backgroundColor: 'var(--color-card)', padding: '15px', borderRadius: '8px', border: '1px solid #444', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '2em', color: 'var(--color-primary)' }}>{clientes.length}</h3>
                        <p style={{ margin: 0, fontSize: '0.9em', color: '#aaa' }}>Activos</p>
                    </div>
                </div>

                {/* Barra de Búsqueda */}
                <div style={{ 
                    marginBottom: '30px', 
                    backgroundColor: 'var(--color-card)', 
                    padding: '15px 20px', 
                    borderRadius: '50px', // Redondeado como en la imagen
                    border: '1px solid #444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <FaSearch style={{ color: '#888', fontSize: '1.2em' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, apellido o teléfono..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            width: '100%',
                            fontSize: '1.1em',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Cuadrícula de Clientes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>Cargando clientes...</p>
                    ) : (
                        filteredClientes.map(cliente => (
                            <ClientCard key={cliente.id_clie} cliente={cliente} />
                        ))
                    )}
                    
                    {!loading && filteredClientes.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#888', gridColumn: '1 / -1', padding: '40px' }}>
                            No se encontraron clientes que coincidan con la búsqueda.
                        </p>
                    )}
                </div>
            </div>
        </BarberLayout>
    );
};

export default ConsultarClientesBarbero;