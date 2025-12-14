// src/pages/barbero/agendar.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaCalendarPlus, FaArrowLeft, FaUser, FaClock, FaCut, FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout';
import styles from '@/styles/Modal.module.css'; 
import { sendWhatsAppReminder } from '@/utils/whatsapp';

// Tipos
interface Cliente { id_clie: number; nom_clie: string; apell_clie: string; tel_clie: string; }
interface Servicio { id_serv: number; tipo: string; precio: string; }

const AgendarRapidoPage: NextPage = () => {
    const router = useRouter();
    
    // Estados
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(false);

    // Formulario Base
    const [idClie, setIdClie] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [hora, setHora] = useState('');

    // 🔑 LÓGICA MULTI-SERVICIO (TICKET)
    const [selectedServicioId, setSelectedServicioId] = useState('');
    const [listaServicios, setListaServicios] = useState<Servicio[]>([]);

    const [barberoId, setBarberoId] = useState<number>(1);

    useEffect(() => {
        const storedUser = localStorage.getItem('userProfile');
        if(storedUser) setBarberoId(JSON.parse(storedUser).id_bar || 1);

        const loadData = async () => {
            const [resCli, resServ] = await Promise.all([ fetch('/api/clientes'), fetch('/api/servicios') ]);
            if(resCli.ok) setClientes(await resCli.json());
            if(resServ.ok) setServicios(await resServ.json());
        };
        loadData();
    }, []);

    // Agregar servicio a la lista
    const handleAddService = () => {
        if (!selectedServicioId) return;
        const serv = servicios.find(s => s.id_serv.toString() === selectedServicioId);
        if (serv) {
            setListaServicios([...listaServicios, serv]);
            setSelectedServicioId(''); // Limpiar select
        }
    };

    // Quitar servicio
    const handleRemoveService = (index: number) => {
        const newList = [...listaServicios];
        newList.splice(index, 1);
        setListaServicios(newList);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (listaServicios.length === 0) return alert("Agrega al menos un servicio a la cita.");

        setLoading(true);

        try {
            // 1. Preparar Datos Inteligentes
            // El servicio principal será el primero de la lista (para la DB)
            const servicioPrincipal = listaServicios[0];
            
            // Los demás servicios los guardamos en observaciones para que el barbero lo sepa
            let notasExtra = "";
            if (listaServicios.length > 1) {
                const extras = listaServicios.slice(1).map(s => s.tipo).join(', ');
                notasExtra = ` (+ Servicios extra: ${extras})`;
            }

            // 2. Guardar Cita
            const res = await fetch('/api/citas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_clie: idClie,
                    id_serv: servicioPrincipal.id_serv, // ID requerido por DB
                    fecha: fecha,
                    hora: hora,
                    id_bar: barberoId,
                    observaciones: `Multiservicio${notasExtra}` // Guardamos el detalle aquí
                }), 
            });

            if (!res.ok) throw new Error("Error al agendar");

            // 3. WhatsApp Confirmación (Con lista completa)
            const cliente = clientes.find(c => c.id_clie.toString() === idClie);
            const listaNombres = listaServicios.map(s => `• ${s.tipo}`).join('\n');

            if (cliente && confirm("✅ Cita Agendada. ¿Enviar confirmación por WhatsApp?")) {
                const msg = `📅 *Cita Confirmada* - The Gentleman's Cut\n\nHola ${cliente.nom_clie}, te esperamos:\n📆 Día: ${fecha}\n⏰ Hora: ${hora}\n\n✂️ *Servicios Agendados:*\n${listaNombres}\n\n¡Nos vemos!`;
                sendWhatsAppReminder(cliente.tel_clie, msg);
            }

            router.push('/barbero/citas');

        } catch (error) {
            alert("Hubo un problema al agendar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head><title>Agendar Cita</title></Head>

            <div style={{maxWidth: '600px', margin: '0 auto'}}>
                <button onClick={() => router.push('/barbero/dashboard')} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1.2em', marginBottom: 20, display:'flex', alignItems:'center', gap:5}}>
                    <FaArrowLeft /> Cancelar
                </button>

                <div className={styles.modalContent} style={{maxWidth: '100%', padding: '30px'}}>
                    <div className={styles.modalHeader}>
                        <h2 style={{color: '#0D6EFD', margin: 0, display: 'flex', alignItems: 'center', gap: 10}}>
                            <FaCalendarPlus /> Agendar Cita
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Cliente */}
                        <div className={styles.formGroup}>
                            <label><FaUser/> Cliente</label>
                            <select value={idClie} onChange={(e) => setIdClie(e.target.value)} required className={styles.input} style={{padding: 12, width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white'}}>
                                <option value="">Selecciona al cliente...</option>
                                {clientes.map(c => (
                                    <option key={c.id_clie} value={c.id_clie}>{c.nom_clie} {c.apell_clie}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha y Hora */}
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label><FaCalendarPlus/> Fecha</label>
                                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className={styles.input} style={{padding: 12, width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white'}}/>
                            </div>
                            <div className={styles.formGroup}>
                                <label><FaClock/> Hora</label>
                                <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required className={styles.input} style={{padding: 12, width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white'}}/>
                            </div>
                        </div>

                        <hr style={{borderColor: '#333', margin: '20px 0'}}/>

                        {/* 🔑 SELECCIÓN DE MÚLTIPLES SERVICIOS */}
                        <div className={styles.formGroup}>
                            <label><FaCut/> Servicios a realizar</label>
                            <div style={{display: 'flex', gap: 10}}>
                                <select 
                                    value={selectedServicioId} 
                                    onChange={(e) => setSelectedServicioId(e.target.value)} 
                                    className={styles.input} 
                                    style={{padding: 12, width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white'}}
                                >
                                    <option value="">-- Agregar Servicio --</option>
                                    {servicios.map(s => (
                                        <option key={s.id_serv} value={s.id_serv}>{s.tipo}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={handleAddService} style={{background: '#28a745', color: 'white', border: 'none', borderRadius: 6, width: 50, cursor: 'pointer', fontSize: '1.2em'}}>
                                    <FaPlus />
                                </button>
                            </div>

                            {/* Lista de seleccionados */}
                            <div style={{marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 10}}>
                                {listaServicios.length === 0 && <span style={{color: '#666', fontStyle: 'italic', fontSize: '0.9em'}}>No has agregado servicios.</span>}
                                {listaServicios.map((s, idx) => (
                                    <div key={idx} style={{background: '#333', padding: '5px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #555'}}>
                                        <span style={{color: 'white'}}>{s.tipo}</span>
                                        <FaTimes 
                                            size={12} 
                                            color="#ff6b6b" 
                                            style={{cursor: 'pointer'}} 
                                            onClick={() => handleRemoveService(idx)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitButton} 
                            disabled={loading || listaServicios.length === 0} 
                            style={{width: '100%', marginTop: 20, background: '#0D6EFD', color: 'white', padding: 15, fontSize: '1.1em'}}
                        >
                            {loading ? 'Guardando...' : 'Confirmar Cita'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AgendarRapidoPage;