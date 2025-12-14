// src/pages/personal/[id].tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '@/components/AdminLayout';
import { FaUserTie, FaArrowLeft, FaBoxOpen, FaSyncAlt, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';
import styles from '@/styles/Modal.module.css'; // Usamos estilos del modal

// Tipos
interface Barbero { id_bar: number; nom_bar: string; apell_bar: string; tel_bar: string; email_bar: string; estado: string; }
interface Insumo { id_ib: number; id_insumo: number; nombre: string; usos_restantes: number; capacidad_total: number; stock_bodega: number; estado: string; }
interface CatalogoItem { id_insumo: number; nombre: string; stock_bodega: number; }

const PerfilBarberoPage: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const [barbero, setBarbero] = useState<Barbero | null>(null);
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]); // 🔑 Lista para el dropdown
    const [loading, setLoading] = useState(true);
    
    // Estado del Modal de Asignación
    const [showModal, setShowModal] = useState(false);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');

    const fetchData = async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/personal/${id}`);
            if (res.ok) {
                const data = await res.json();
                setBarbero(data.perfil);
                setInsumos(data.insumos);
                setCatalogo(data.catalogo);
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [id]);

    // Lógica 1: RE-STOCK (PUT)
    const handleRestock = async (id_ib: number, id_insumo: number, nombre: string) => {
        if(!confirm(`¿Surtir 1 unidad de "${nombre}"? Se descontará de bodega.`)) return;
        try {
            const res = await fetch(`/api/personal/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id_ib, id_insumo })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            alert("✅ Surtido exitoso.");
            fetchData();
        } catch (error: any) { alert(error.message); }
    };

    // Lógica 2: ASIGNAR NUEVO (POST) - 🔑 NUEVO
    const handleAsignarNuevo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInsumoId) return alert("Selecciona un insumo");

        try {
            const res = await fetch(`/api/personal/${id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id_insumo: selectedInsumoId })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            
            alert("✅ Insumo asignado correctamente.");
            setShowModal(false);
            setSelectedInsumoId('');
            fetchData();
        } catch (error: any) { alert(error.message); }
    };

    // Filtramos el catálogo para no mostrar lo que ya tiene asignado
    const insumosDisponibles = catalogo.filter(c => !insumos.some(i => i.id_insumo === c.id_insumo));

    if (loading) return <AdminLayout><p style={{color:'white', padding:30}}>Cargando...</p></AdminLayout>;
    if (!barbero) return <AdminLayout><p style={{color:'red', padding:30}}>Barbero no encontrado.</p></AdminLayout>;

    return (
        <AdminLayout>
            <Head><title>{barbero.nom_bar} - Perfil</title></Head>
            
            {/* --- MODAL PARA ASIGNAR NUEVO INSUMO --- */}
            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 style={{color: 'var(--color-accent)'}}>Asignar Nuevo Material</h2>
                            <button onClick={() => setShowModal(false)} className={styles.closeButton}><FaTimes/></button>
                        </div>
                        <form onSubmit={handleAsignarNuevo}>
                            <div className={styles.formGroup}>
                                <label>Selecciona el Insumo de la Bodega:</label>
                                <select 
                                    className={styles.input}
                                    value={selectedInsumoId}
                                    onChange={(e) => setSelectedInsumoId(e.target.value)}
                                    required
                                    style={{background: '#1a1a1a', color: 'white', padding: 10, width: '100%', border: '1px solid #444', borderRadius: 5}}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {insumosDisponibles.map(item => (
                                        <option key={item.id_insumo} value={item.id_insumo} disabled={item.stock_bodega <= 0}>
                                            {item.nombre} (Stock: {item.stock_bodega})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className={styles.submitButton} style={{background: 'var(--color-accent)', color: 'black'}}>Asignar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{maxWidth: '1200px', margin: '0 auto'}}>
                <div style={{marginBottom: 30, display: 'flex', alignItems: 'center', gap: 15}}>
                    <button onClick={() => router.push('/personal')} style={{background:'none', border:'none', color:'#aaa', fontSize:'1.5em', cursor:'pointer'}}><FaArrowLeft/></button>
                    <h1 style={{margin:0, color: 'white'}}>Perfil del Barbero</h1>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30}}>
                    
                    {/* INFO IZQUIERDA */}
                    <div style={{background: '#2A2A2A', padding: 30, borderRadius: 12, border: '1px solid #444', height: 'fit-content'}}>
                        <div style={{textAlign: 'center', marginBottom: 20}}>
                            <div style={{width: 100, height: 100, background: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3em', color: '#1C1C1C', margin: '0 auto 15px'}}>
                                <FaUserTie />
                            </div>
                            <h2 style={{margin:0, color: 'white'}}>{barbero.nom_bar} {barbero.apell_bar}</h2>
                            <p style={{color: '#aaa', marginTop: 5}}>Barbero Activo</p>
                        </div>
                    </div>

                    {/* DERECHA: INVENTARIO ASIGNADO */}
                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                            <h2 style={{color: 'var(--color-accent)', margin: 0, display: 'flex', alignItems: 'center', gap: 10}}>
                                <FaBoxOpen /> Inventario en Estación
                            </h2>
                            {/* 🔑 BOTÓN PARA ABRIR MODAL DE ASIGNACIÓN */}
                            <button 
                                onClick={() => setShowModal(true)}
                                style={{background: '#0D6EFD', color: 'white', border: 'none', padding: '10px 15px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 'bold'}}
                            >
                                <FaPlus /> Asignar Nuevo
                            </button>
                        </div>

                        <div style={{display: 'grid', gap: 15}}>
                            {insumos.map(ins => {
                                const porcentaje = (ins.usos_restantes / ins.capacidad_total) * 100;
                                const esCritico = porcentaje < 20;

                                return (
                                    <div key={ins.id_ib} style={{background: '#1f1f1f', padding: 20, borderRadius: 8, borderLeft: esCritico ? '4px solid #DC3545' : '4px solid #28a745', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20}}>
                                        <div style={{flex: 1}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <strong style={{color: 'white', fontSize: '1.1em'}}>{ins.nombre}</strong>
                                                {esCritico && <span style={{color: '#DC3545', display:'flex', alignItems:'center', gap:5, fontSize:'0.9em'}}><FaExclamationTriangle/> Stock Bajo</span>}
                                            </div>
                                            <div style={{width: '100%', height: 8, background: '#444', borderRadius: 4, marginTop: 10, overflow: 'hidden'}}>
                                                <div style={{width: `${porcentaje}%`, height: '100%', background: esCritico ? '#DC3545' : '#0D6EFD'}}></div>
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginTop: 5, color: '#888'}}>
                                                <span>Restan: {ins.usos_restantes}</span>
                                                <span>Bodega: {ins.stock_bodega}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Botón Re-Stock (PUT) */}
                                        <button 
                                            onClick={() => handleRestock(ins.id_ib, ins.id_insumo, ins.nombre)}
                                            disabled={!esCritico && ins.estado !== 'Solicitado'}
                                            style={{
                                                background: (esCritico || ins.estado === 'Solicitado') ? '#DC3545' : 'transparent', 
                                                border: (esCritico || ins.estado === 'Solicitado') ? 'none' : '1px solid #444',
                                                color: (esCritico || ins.estado === 'Solicitado') ? 'white' : '#666', 
                                                padding: '10px 15px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'
                                            }}
                                        >
                                            {ins.estado === 'Solicitado' ? 'Aprobar Solicitud' : (esCritico ? 'Dar Re-Stock' : 'OK')}
                                        </button>
                                    </div>
                                );
                            })}
                            {insumos.length === 0 && <p style={{color: '#666'}}>No tiene insumos. ¡Asigna uno!</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PerfilBarberoPage;