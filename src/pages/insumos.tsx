// src/pages/insumos.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import layoutStyles from '@/styles/GlobalLayout.module.css';
import styles from '@/styles/Insumos.module.css'; 
import AddInsumoModal from '@/components/AddInsumoModal'; 
import UpdateInsumoModal from '@/components/UpdateInsumoModal'; // 🔑 Importar modal de actualización
import { FaFlask, FaEdit } from 'react-icons/fa';

// 🔑 Definimos la interfaz aquí para que UpdateInsumoModal pueda importarla
export interface Insumo {
    id_insu: number;
    nom_insu: string;
    stock: number; 
    nom_bar: string;
}

const InsumosPage: NextPage = () => {
    const moduleName = "Estado de Insumos"; 

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // 🔑 Estado para modal de actualización
    const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null); // 🔑 Insumo a editar
    
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInsumos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/insumos');
            if (!response.ok) throw new Error('Error al cargar insumos');
            const data = await response.json();
            setInsumos(data.map((i: any) => ({ ...i, stock: parseInt(i.stock, 10) })));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsumos();
    }, []);

    const getStockClass = (stock: number) => {
        if (stock === 0) return styles.fillDanger; // Rojo
        if (stock <= 5) return styles.fillWarning; // Amarillo (Umbral para insumos)
        return styles.fillDefault; // Azul
    };
    
    // 🔑 Abre el modal de actualización
    const handleUpdate = (insumo: Insumo) => {
        setSelectedInsumo(insumo);
        setIsUpdateModalOpen(true);
    };

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            {/* Modal para AÑADIR */}
            {isAddModalOpen && (
                <AddInsumoModal
                    onClose={() => setIsAddModalOpen(false)}
                    onInsumoAdded={fetchInsumos}
                />
            )}
            
            {/* 🔑 Modal para ACTUALIZAR */}
            {isUpdateModalOpen && selectedInsumo && (
                <UpdateInsumoModal
                    insumo={selectedInsumo}
                    onClose={() => setIsUpdateModalOpen(false)}
                    onInsumoUpdated={fetchInsumos}
                />
            )}

            <main className={layoutStyles.mainContent}> 
                {/* ... (Encabezado y botón + Añadir Insumo) ... */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>
                        <FaFlask style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        {moduleName}
                    </h1>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
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
                       + Añadir Nuevo Insumo
                    </button>
                </div>
                
                <p style={{ color: '#aaa', marginBottom: '40px' }}>
                    Controla la cantidad de productos consumibles que se usan en los servicios.
                </p>

                {loading && <p>Cargando insumos...</p>}
                {error && <p style={{color: 'var(--color-danger)'}}>{error}</p>}

                {/* Grid de Insumos (Ahora muestra Stock) */}
                <div className={styles.grid}>
                    {!loading && !error && insumos.map((insumo) => (
                        <div key={insumo.id_insu} className={`${styles.insumoCard} ${getStockClass(insumo.stock)}`}>
                            <div className={styles.cardHeader}>
                                <h3>{insumo.nom_insu}</h3>
                                <button 
                                    className={styles.updateButton} 
                                    title="Actualizar stock"
                                    onClick={() => handleUpdate(insumo)} // 🔑 Llama a la función de actualización
                                >
                                    <FaEdit />
                                </button>
                            </div>
                            
                            <h2 className={styles.percentageText} style={{fontSize: '2.5em'}}>
                                {insumo.stock}
                            </h2>
                            <span style={{textAlign: 'center', color: 'var(--color-label)'}}>Unidades Restantes</span>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
};

export default InsumosPage;