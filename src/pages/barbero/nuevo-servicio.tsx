// src/pages/barbero/nuevo-servicio.tsx

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaCut, FaArrowLeft, FaMoneyBillWave, FaUser, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout';
import styles from '@/styles/Modal.module.css'; 
import { sendWhatsAppReminder } from '@/utils/whatsapp';
import CobroModal from '@/components/CobroModal'; 

interface Cliente { id_clie: number; nom_clie: string; apell_clie: string; tel_clie: string; }
interface ServicioDB { id_serv: number; tipo: string; precio: string; }
interface ServicioTicket { id_serv: number; nombre: string; precio: number; }

const categoriasServicios = [
    "Corte de cabello", "Arreglo de barba y bigote", "Afeitado clásico",
    "Tratamientos capilares", "Tratamientos faciales", "Tintes",
    "Ondulación", "Manicura y pedicura", "Depilación", "Masajes", "Diseños"
];

const NuevoServicioPage: NextPage = () => {
    const router = useRouter();
    const { clienteId } = router.query;

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [serviciosDB, setServiciosDB] = useState<ServicioDB[]>([]);
    
    const [selectedClient, setSelectedClient] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); 
    
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [precioActual, setPrecioActual] = useState(0);
    const [ticket, setTicket] = useState<ServicioTicket[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [showCobroModal, setShowCobroModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resCli, resServ] = await Promise.all([
                    fetch('/api/clientes'),
                    fetch('/api/servicios')
                ]);
                if (resCli.ok) setClientes(await resCli.json());
                if (resServ.ok) setServiciosDB(await resServ.json());
                if (clienteId) setSelectedClient(clienteId as string);
            } catch (error) { console.error("Error cargando datos", error); }
        };
        loadData();
    }, [clienteId]);

    const serviciosFiltrados = serviciosDB.filter(s => {
        if (!selectedCategory) return true;
        const cat = selectedCategory.toLowerCase();
        const serv = s.tipo.toLowerCase();
        return serv.includes(cat) || cat.includes(serv);
    });

    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedServiceId(id);
        const servicio = serviciosDB.find(s => s.id_serv.toString() === id);
        if (servicio) setPrecioActual(parseFloat(servicio.precio));
    };

    const handleAddToTicket = () => {
        if (!selectedServiceId) return;
        const servicio = serviciosDB.find(s => s.id_serv.toString() === selectedServiceId);
        if (servicio) {
            setTicket([...ticket, { id_serv: servicio.id_serv, nombre: servicio.tipo, precio: precioActual }]);
            setSelectedServiceId('');
            setPrecioActual(0);
        }
    };

    const handleRemoveFromTicket = (index: number) => {
        const newTicket = [...ticket];
        newTicket.splice(index, 1);
        setTicket(newTicket);
    };

    const totalTicket = ticket.reduce((sum, item) => sum + item.precio, 0);

    // --- FUNCIÓN PARA ABRIR MODAL ---
    const abrirModal = (e: React.FormEvent) => {
        e.preventDefault(); 
        if (!selectedClient) return alert("Selecciona un cliente.");
        if (ticket.length === 0) return alert("Agrega al menos un servicio.");
        
        setShowCobroModal(true); 
    };

    // --- FUNCIÓN PRINCIPAL DE GUARDADO (Aquí integramos los insumos) ---
    const guardarEnBaseDeDatos = async (metodoPago: string, propina: number, totalFinal: number) => {
        setLoading(true);
        setShowCobroModal(false);

        try {
            // 1. Guardar el Servicio (Venta)
            const response = await fetch('/api/barbero/registrar-servicio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_clie: selectedClient,
                    servicios: ticket, 
                    fecha: fecha,
                    precio_final: totalFinal 
                }),
            });

            if (!response.ok) throw new Error('Error al registrar');

            // 🔑 2. NUEVO: DESCONTAR INSUMOS AUTOMÁTICAMENTE
            // Intentamos obtener el ID del barbero logueado, si no existe usamos 1 como fallback
            const userData = localStorage.getItem('userProfile');
            const id_bar = userData ? JSON.parse(userData).id_bar : 1; 

            // Llamada silenciosa a la API de insumos (no detiene el flujo si falla)
            await fetch('/api/barbero/descontar-insumos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_bar: id_bar })
            }).catch(err => console.error("Error descontando insumos", err));

            // 3. Flujo de WhatsApp y Redirección
            const cliente = clientes.find(c => c.id_clie.toString() === selectedClient);
            const mensajeConfirm = `✅ Cobro de $${totalFinal.toFixed(2)} registrado con éxito.\n\n¿Enviar ticket por WhatsApp?`;

            if (cliente && confirm(mensajeConfirm)) {
                const detalles = ticket.map(t => `• ${t.nombre}`).join('\n');
                const whatsappMsg = `💈 *The Gentleman's Cut* 💈\n\nHola ${cliente.nom_clie}!\nGracias por tu visita.\n\n✅ *Servicios:*\n${detalles}\n\n💰 Total: $${totalFinal.toFixed(2)}\n💳 Pago: ${metodoPago}\n\n¡Vuelve pronto!`;
                sendWhatsAppReminder(cliente.tel_clie, whatsappMsg);
            }

            if (clienteId) router.push(`/barbero/clientes/${clienteId}`);
            else router.push('/barbero/dashboard');

        } catch (error) {
            alert('Error al registrar la venta.');
        } finally {
            setLoading(false);
        }
    };

    const currentClientName = clientes.find(c => c.id_clie.toString() === selectedClient)?.nom_clie || "Cliente";

    return (
        <>
            <Head><title>Nuevo Servicio - Ticket</title></Head>

            {showCobroModal && (
                <CobroModal 
                    cita={{
                        id_cita: 0, 
                        nombre_cliente: currentClientName,
                        nombre_servicio: ticket.length > 1 ? "Varios Servicios" : (ticket[0]?.nombre || ""),
                        precio_estimado: totalTicket
                    }}
                    onClose={() => setShowCobroModal(false)}
                    onConfirm={guardarEnBaseDeDatos} 
                />
            )}

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px'}}>
                    <FaArrowLeft /> Volver
                </button>

                <div className={styles.modalContent} style={{ maxWidth: '100%' }}>
                    <div className={styles.modalHeader}>
                        <h2 style={{ color: 'var(--color-accent)' }}>
                            <FaCut style={{marginRight: 10}}/> Crear Ticket
                        </h2>
                    </div>
                    
                    <form onSubmit={abrirModal}>
                        
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label><FaUser /> Cliente</label>
                                <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} required className={styles.input} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}>
                                    <option value="">Selecciona cliente...</option>
                                    {clientes.map(c => <option key={c.id_clie} value={c.id_clie}>{c.nom_clie} {c.apell_clie}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Fecha</label>
                                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}/>
                            </div>
                        </div>

                        <hr style={{ borderColor: '#444', margin: '20px 0' }} />

                        <div style={{ backgroundColor: '#252525', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Categoría</label>
                                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}>
                                        <option value="">-- Todas --</option>
                                        {categoriasServicios.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Servicio</label>
                                    <select value={selectedServiceId} onChange={handleServiceSelect} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}>
                                        <option value="">Selecciona...</option>
                                        {serviciosFiltrados.map(s => (
                                            <option key={s.id_serv} value={s.id_serv}>{s.tipo} (${parseFloat(s.precio).toFixed(2)})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                                <div className={styles.formGroup} style={{ flexGrow: 1 }}>
                                    <label>Precio ($)</label>
                                    <input type="number" value={precioActual} onChange={(e) => setPrecioActual(parseFloat(e.target.value))} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: '#4caf50', border: '1px solid #444', width: '100%', fontWeight: 'bold' }} />
                                </div>
                                <button type="button" onClick={handleAddToTicket} style={{ padding: '10px 20px', backgroundColor: '#0D6EFD', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '42px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaPlus /> Agregar
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            {ticket.length > 0 && (
                                <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #444', borderRadius: '6px', overflow: 'hidden' }}>
                                    {ticket.map((item, index) => (
                                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', borderBottom: '1px solid #444', backgroundColor: '#2a2a2a', alignItems: 'center' }}>
                                            <span>{item.nombre}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>${item.precio.toFixed(2)}</span>
                                                <button type="button" onClick={() => handleRemoveFromTicket(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><FaTrash /></button>
                                            </div>
                                        </li>
                                    ))}
                                    <li style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#333', fontWeight: 'bold', fontSize: '1.2em' }}>
                                        <span style={{color: 'white'}}>Total:</span>
                                        <span style={{color: '#4caf50'}}>${totalTicket.toFixed(2)}</span>
                                    </li>
                                </ul>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitButton} 
                            style={{width: '100%', marginTop: '10px', backgroundColor: 'var(--color-accent)', color: 'black', fontSize: '1.1em', padding: '15px'}} 
                            disabled={loading || ticket.length === 0}
                        >
                            {loading ? 'Procesando...' : 'Cobrar Ticket'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default NuevoServicioPage;

