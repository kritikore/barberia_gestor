// src/pages/barbero/caja-rapida.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaSearch, FaUser, FaTimes, FaCashRegister, FaArrowLeft, FaPlus, FaCheck } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout';
import CobroModal from '@/components/CobroModal';
import { sendWhatsAppReminder } from '@/utils/whatsapp';

interface Cliente { id_clie: number; nom_clie: string; apell_clie: string; tel_clie: string; }
interface ServicioDB { id_serv: number; tipo: string; precio: string; }
interface ServicioTicket { id_serv: number; nombre: string; precio: number; }

const CajaRapidaPage: NextPage = () => {
    const router = useRouter();
    
    // Datos Base
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [serviciosDB, setServiciosDB] = useState<ServicioDB[]>([]);
    
    // Estado de la Venta
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [ticket, setTicket] = useState<ServicioTicket[]>([]);
    
    // Modales y Cargas
    const [loading, setLoading] = useState(false);
    const [showCobroModal, setShowCobroModal] = useState(false);

    // 1. Cargar Datos al inicio
    useEffect(() => {
        const loadData = async () => {
            try {
                const [resCli, resServ] = await Promise.all([
                    fetch('/api/clientes'),
                    fetch('/api/servicios')
                ]);
                if (resCli.ok) setClientes(await resCli.json());
                if (resServ.ok) setServiciosDB(await resServ.json());
            } catch (error) { console.error(error); }
        };
        loadData();
    }, []);

    // Filtro de Clientes
    const clientesFiltrados = searchTerm.length > 0 
        ? clientes.filter(c => 
            `${c.nom_clie} ${c.apell_clie}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.tel_clie.includes(searchTerm)
          ).slice(0, 5) // Limitamos a 5 resultados para no saturar
        : [];

    // Agregar al Ticket
    const addToTicket = (servicio: ServicioDB) => {
        setTicket([...ticket, { 
            id_serv: servicio.id_serv, 
            nombre: servicio.tipo, 
            precio: parseFloat(servicio.precio) 
        }]);
    };

    // Quitar del Ticket
    const removeFromTicket = (index: number) => {
        const newTicket = [...ticket];
        newTicket.splice(index, 1);
        setTicket(newTicket);
    };

    const totalTicket = ticket.reduce((sum, item) => sum + item.precio, 0);

    // Procesar Cobro (Guardar en DB)
    const handleConfirmPayment = async (metodoPago: string, propina: number, totalFinal: number) => {
        if (!selectedClient) return alert("Error: Cliente no seleccionado");
        setLoading(true);
        setShowCobroModal(false);

        try {
            // 1. Guardar Servicio
            const res = await fetch('/api/barbero/registrar-servicio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_clie: selectedClient.id_clie,
                    servicios: ticket,
                    fecha: new Date().toISOString(),
                    precio_final: totalFinal
                }),
            });
            if (!res.ok) throw new Error("Error al guardar venta");

            // 2. Descontar Insumos (Silencioso)
            const userData = localStorage.getItem('userProfile');
            const id_bar = userData ? JSON.parse(userData).id_bar : 1;
            fetch('/api/barbero/descontar-insumos', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id_bar })
            });

            // 3. WhatsApp
            if (confirm("✅ Venta registrada. ¿Enviar ticket por WhatsApp?")) {
                const detalles = ticket.map(t => `• ${t.nombre}`).join('\n');
                const msg = `💈 *The Gentleman's Cut* 💈\n\nHola ${selectedClient.nom_clie}!\nServicio realizado:\n${detalles}\n\nTotal: $${totalFinal.toFixed(2)}\n\n¡Gracias!`;
                sendWhatsAppReminder(selectedClient.tel_clie, msg);
            }

            // Resetear Pantalla para el siguiente cliente
            setSelectedClient(null);
            setTicket([]);
            setSearchTerm('');

        } catch (error) {
            alert("Error al procesar la venta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head><title>Caja Rápida</title></Head>

            {showCobroModal && selectedClient && (
                <CobroModal 
                    cita={{
                        id_cita: 0, 
                        nombre_cliente: `${selectedClient.nom_clie} ${selectedClient.apell_clie}`,
                        nombre_servicio: ticket.length > 1 ? "Varios Servicios" : ticket[0]?.nombre,
                        precio_estimado: totalTicket
                    }}
                    onClose={() => setShowCobroModal(false)}
                    onConfirm={handleConfirmPayment}
                />
            )}

            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20}}>
                <button onClick={() => router.push('/barbero/dashboard')} style={{background: 'none', border: 'none', color: '#aaa', fontSize: '1.5em', cursor: 'pointer'}}><FaArrowLeft/></button>
                <h1 style={{margin: 0, color: 'white'}}>Caja Rápida</h1>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start'}}>
                
                {/* COLUMNA IZQUIERDA: SELECCIÓN */}
                <div>
                    {/* 1. BUSCADOR DE CLIENTE */}
                    <div style={{background: '#2A2A2A', padding: 20, borderRadius: 12, marginBottom: 20, border: '1px solid #444'}}>
                        <h3 style={{marginTop: 0, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 10}}><FaUser/> 1. Cliente</h3>
                        
                        {!selectedClient ? (
                            <div style={{position: 'relative'}}>
                                <div style={{display: 'flex', alignItems: 'center', background: '#1a1a1a', borderRadius: 8, padding: '0 15px', border: '1px solid #555'}}>
                                    <FaSearch color="#888"/>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{width: '100%', padding: '15px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.1em', outline: 'none'}}
                                    />
                                </div>
                                {searchTerm.length > 0 && (
                                    <div style={{position: 'absolute', top: '100%', left: 0, right: 0, background: '#333', zIndex: 10, borderRadius: '0 0 8px 8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
                                        {clientesFiltrados.map(c => (
                                            <div 
                                                key={c.id_clie} 
                                                onClick={() => { setSelectedClient(c); setSearchTerm(''); }}
                                                style={{padding: '15px', borderBottom: '1px solid #444', cursor: 'pointer', color: 'white'}}
                                            >
                                                <strong>{c.nom_clie} {c.apell_clie}</strong>
                                            </div>
                                        ))}
                                        {clientesFiltrados.length === 0 && <div style={{padding: '15px', color: '#aaa'}}>No se encontraron clientes.</div>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{background: 'rgba(13, 110, 253, 0.2)', border: '1px solid #0D6EFD', padding: '15px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <strong style={{color: 'white', fontSize: '1.2em'}}>{selectedClient.nom_clie} {selectedClient.apell_clie}</strong>
                                    <div style={{color: '#ccc', fontSize: '0.9em'}}>Cliente seleccionado</div>
                                </div>
                                <button onClick={() => setSelectedClient(null)} style={{background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1.2em'}}><FaTimes/></button>
                            </div>
                        )}
                    </div>

                    {/* 2. GRID DE SERVICIOS */}
                    <div style={{background: '#2A2A2A', padding: 20, borderRadius: 12, border: '1px solid #444'}}>
                        <h3 style={{marginTop: 0, color: 'var(--color-accent)'}}>2. Servicios Rápidos</h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10}}>
                            {serviciosDB.map(s => (
                                <button 
                                    key={s.id_serv} 
                                    onClick={() => addToTicket(s)}
                                    style={{
                                        background: '#333', border: '1px solid #555', borderRadius: 8, padding: '15px 10px', 
                                        color: 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5
                                    }}
                                >
                                    <span style={{fontWeight: 'bold'}}>{s.tipo}</span>
                                    <span style={{color: '#4caf50', fontSize: '0.9em'}}>${parseFloat(s.precio).toFixed(0)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: TICKET Y COBRO */}
                <div style={{background: '#2A2A2A', padding: 25, borderRadius: 12, border: '1px solid #444', position: 'sticky', top: 20}}>
                    <h3 style={{marginTop: 0, color: 'white', borderBottom: '1px solid #444', paddingBottom: 15, marginBottom: 15}}>Ticket de Venta</h3>
                    
                    {ticket.length === 0 ? (
                        <p style={{color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px 0'}}>Ticket vacío</p>
                    ) : (
                        <ul style={{listStyle: 'none', padding: 0, marginBottom: 20}}>
                            {ticket.map((item, index) => (
                                <li key={index} style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px dashed #444', paddingBottom: 5}}>
                                    <span style={{color: '#ccc'}}>{item.nombre}</span>
                                    <div style={{display: 'flex', gap: 10}}>
                                        <span style={{color: 'white'}}>${item.precio}</span>
                                        <FaTimes color="#ff6b6b" style={{cursor: 'pointer'}} onClick={() => removeFromTicket(index)}/>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.5em', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: 20}}>
                        <span>Total:</span>
                        <span>${totalTicket.toFixed(2)}</span>
                    </div>

                    <button 
                        onClick={() => setShowCobroModal(true)}
                        disabled={!selectedClient || ticket.length === 0}
                        style={{
                            width: '100%', padding: '15px', borderRadius: 8, border: 'none',
                            background: (!selectedClient || ticket.length === 0) ? '#444' : '#28a745',
                            color: (!selectedClient || ticket.length === 0) ? '#888' : 'white',
                            fontSize: '1.2em', fontWeight: 'bold', cursor: (!selectedClient || ticket.length === 0) ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10
                        }}
                    >
                        <FaCashRegister /> COBRAR
                    </button>
                    {(!selectedClient && ticket.length > 0) && <p style={{color: '#ff6b6b', textAlign: 'center', marginTop: 10, fontSize: '0.9em'}}>* Selecciona un cliente primero</p>}
                </div>

            </div>
        </>
    );
};

export default CajaRapidaPage;