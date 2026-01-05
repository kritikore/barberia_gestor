import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
    FaCalendarAlt, FaArrowLeft, FaClock, FaCheckCircle, 
    FaExclamationCircle, FaDollarSign, FaBan, FaCheck, FaTrash, FaRegClock, FaPlus 
} from 'react-icons/fa';
import { useBarbero } from '@/hooks/useBarbero';
import TicketModal from '@/components/TicketModal';
import CheckoutModal from '@/components/CheckoutModal';
import ReagendarModal from '@/components/ReagendarModal';
import AddCitaModal from '@/components/AddCitaModal'; // 👈 IMPORTANTE
import styles from '@/styles/Servicios.module.css';

const MisCitasPage: NextPage = () => {
    const router = useRouter();
    const { barbero, loading: sessionLoading } = useBarbero();
    const [citas, setCitas] = useState<any[]>([]);
    
    const hoy = new Date().toLocaleDateString('en-CA'); 
    const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);

    // Estados para Modales
    const [ticketData, setTicketData] = useState<any>(null);
    const [citaParaCobrar, setCitaParaCobrar] = useState<any>(null);
    const [citaParaReagendar, setCitaParaReagendar] = useState<any>(null);
    
    // 👇 NUEVO ESTADO: SLOT SELECCIONADO PARA AGENDAR
    const [slotParaAgendar, setSlotParaAgendar] = useState<{fecha: string, hora: string} | null>(null);

    const fetchCitas = async () => {
        if (!barbero) return;
        try {
            const res = await fetch('/api/citas');
            if (res.ok) {
                const data = await res.json();
                const misCitasHoy = data.filter((c: any) => 
                    c.id_bar === barbero.id_bar && 
                    c.fecha.substring(0, 10) === fechaSeleccionada 
                );
                setCitas(misCitasHoy);
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => { if (barbero) fetchCitas(); }, [barbero, fechaSeleccionada]);

    const intervalos = [];
    for (let hora = 9; hora <= 20; hora++) {
        intervalos.push(`${hora < 10 ? '0'+hora : hora}:00`);
        if (hora < 20) intervalos.push(`${hora < 10 ? '0'+hora : hora}:30`);
    }

    const getCitaEnHorario = (horario: string) => {
        return citas.find(c => c.hora.substring(0, 5) === horario);
    };

    // ... (Funciones de eliminar, cobrar, etc. se mantienen igual) ...
    const handleDelete = async (id: number) => {
        if(!confirm("¿Eliminar esta cita?")) return;
        try { await fetch(`/api/citas/${id}`, { method: 'DELETE' }); fetchCitas(); } catch(e) { alert("Error"); }
    };
    const marcarNoAsistio = async (id: number) => {
        if(!confirm("¿Cliente NO llegó?")) return;
        try { await fetch(`/api/citas/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({estado:'No Asistió'}) }); fetchCitas(); } catch(e) { alert("Error"); }
    };
    
   const handleConfirmarCobro = async (metodo: string, datos?: any) => {
        // CORRECCIÓN AQUÍ: Agregamos "!barbero" para proteger contra nulos
        if (!citaParaCobrar || !barbero) return; 
        
        try {
            // 1. Guardamos el cobro en la base de datos
            const res = await fetch(`/api/citas/${citaParaCobrar.id_cita}`, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json'}, 
                body: JSON.stringify({estado:'Completada', metodo_pago: metodo}) 
            });

            if (res.ok) {
                // === AUTOMATIZACIÓN WHATSAPP ===
                const telefono = citaParaCobrar.tel_clie || citaParaCobrar.telefono; 
                
                if (telefono && telefono.length > 5) {
                    const telLimpio = telefono.replace(/\D/g, '');
                    const numeroFinal = telLimpio.length === 10 ? `52${telLimpio}` : telLimpio;
                    
                    const nombre = citaParaCobrar.nombre_cliente || "Cliente";
                    const servicio = citaParaCobrar.nombre_servicio || "Corte";
                    const precio = citaParaCobrar.precio || 0;
                    
                    const mensaje = `Hola *${nombre}* 👋,\n\nGracias por tu visita hoy. Tu servicio de *${servicio}* ($${precio}) ha sido cobrado exitosamente.\n\n¡Te esperamos pronto! 💈`;
                    
                    const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`;
                    window.open(url, '_blank');
                }

                // 2. Mostramos el Ticket
                setTicketData({ 
                    ...citaParaCobrar, 
                    metodoPago: metodo, 
                    fecha: citaParaCobrar.fecha.substring(0,10), 
                    precio: citaParaCobrar.precio||0, 
                    // Como validamos arriba, aquí ya no dará error
                    barbero: `${barbero.nom_bar} ${barbero.apell_bar}`, 
                    cliente: citaParaCobrar.nombre_cliente, 
                    servicio: citaParaCobrar.nombre_servicio, 
                    folio: citaParaCobrar.id_cita 
                });
                
                setCitaParaCobrar(null); 
                fetchCitas();
            }
        } catch (error) { console.error(error); }
    };

    if (sessionLoading) return null;

    return (
        <>
            <Head><title>Mi Agenda</title></Head>

            {citaParaCobrar && <CheckoutModal cita={citaParaCobrar} onClose={() => setCitaParaCobrar(null)} onConfirm={handleConfirmarCobro} />}
            {ticketData && <TicketModal data={ticketData} onClose={() => setTicketData(null)} />}
            {citaParaReagendar && <ReagendarModal cita={citaParaReagendar} onClose={() => setCitaParaReagendar(null)} onSuccess={fetchCitas} />}
            
            {/* 👇 MODAL DE NUEVA CITA (Desde Slot) */}
            {slotParaAgendar && (
                <AddCitaModal 
                    onClose={() => setSlotParaAgendar(null)} 
                    onSuccess={() => { setSlotParaAgendar(null); fetchCitas(); }}
                    preSelectedDate={slotParaAgendar.fecha} // Pasamos fecha
                    preSelectedTime={slotParaAgendar.hora}   // Pasamos hora
                />
            )}

            <main>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: 15 }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
                        <button onClick={() => router.back()} style={{background:'none', border:'none', color:'#aaa', cursor:'pointer', fontSize:'1.2rem'}}><FaArrowLeft /></button>
                        <h1 style={{margin:0, display:'flex', alignItems:'center'}}>
                            <FaCalendarAlt style={{color:'var(--color-accent)', marginRight:10}}/> Agenda del Día
                        </h1>
                    </div>
                    <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} />
                </div>

                <div style={{background: '#1a1a1a', borderRadius: '16px', padding: '20px', border: '1px solid #333'}}>
                    {intervalos.map((horario) => {
                        const cita = getCitaEnHorario(horario);
                        const esMediaHora = horario.includes(':30');

                        return (
                            <div key={horario} style={{ display: 'flex', borderBottom: '1px solid #333', minHeight: '80px', padding: '10px 0', backgroundColor: esMediaHora ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                <div style={{ width: '80px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: esMediaHora ? '#666' : '#aaa', fontWeight: esMediaHora ? 'normal' : 'bold' }}>
                                    {horario}
                                </div>

                                <div style={{flex: 1, paddingLeft: '15px', display: 'flex', alignItems: 'center'}}>
                                    {cita ? (
                                        // TARJETA DE CITA (IGUAL QUE ANTES)
                                        <div style={{
                                            background: cita.estado === 'Completada' ? 'rgba(40, 167, 69, 0.1)' : cita.estado === 'No Asistió' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)', 
                                            borderLeft: `4px solid ${cita.estado === 'Completada' ? '#28a745' : cita.estado === 'No Asistió' ? '#dc3545' : '#ffc107'}`,
                                            width: '100%', padding: '10px 15px', borderRadius: '6px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{fontWeight: 'bold', color: 'white', fontSize: '1.1em', marginBottom: 3}}>{cita.nombre_cliente}</div>
                                                <div style={{color: '#aaa', fontSize: '0.9em', display: 'flex', gap: 10, alignItems:'center'}}>
                                                    <span><FaClock size={10} style={{marginRight:3}}/> {cita.hora.slice(0,5)}</span>
                                                    <span style={{color: '#fff', fontWeight:'bold'}}>• {cita.nombre_servicio}</span>
                                                </div>
                                            </div>
                                            <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                                                <div style={{color: '#85ff9e', fontWeight: 'bold', fontSize: '1.1em', display: 'flex', alignItems: 'center'}}><FaDollarSign size={14}/> {cita.precio || 0}</div>
                                                {cita.estado === 'Pendiente' ? (
                                                    <div style={{display:'flex', gap: 5, marginTop: 5}}>
                                                        <button onClick={() => setCitaParaReagendar(cita)} title="Reagendar" style={{background:'#0D6EFD', border:'none', color:'white', padding:'5px 8px', borderRadius:'4px', cursor:'pointer'}}><FaRegClock size={12}/></button>
                                                        <button onClick={() => handleDelete(cita.id_cita)} title="Eliminar" style={{background:'#333', border:'1px solid #555', color:'#aaa', padding:'5px 8px', borderRadius:'4px', cursor:'pointer'}}><FaTrash size={12}/></button>
                                                        <button onClick={() => marcarNoAsistio(cita.id_cita)} title="No Llegó" style={{background:'#dc3545', border:'none', color:'white', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8em'}}><FaBan /></button>
                                                        <button onClick={() => setCitaParaCobrar(cita)} title="Cobrar" style={{background:'#28a745', border:'none', color:'white', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.8em', display:'flex', alignItems:'center', gap:5}}><FaCheck /> Cobrar</button>
                                                    </div>
                                                ) : (
                                                    <span style={{color: cita.estado === 'Completada' ? '#28a745' : '#dc3545', fontWeight: 'bold', fontSize: '0.85em'}}>{cita.estado}</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // 👇 HUECO VACÍO CLICABLE
                                        <div 
                                            onClick={() => setSlotParaAgendar({ fecha: fechaSeleccionada, hora: horario })}
                                            style={{
                                                color: '#444', fontStyle: 'italic', fontSize: '0.9em', 
                                                border: '1px dashed #333', padding: '10px', borderRadius: '6px', textAlign:'center',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                height: '100%'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 193, 7, 0.05)'; e.currentTarget.style.borderColor = '#ffc107'; e.currentTarget.style.color = '#ffc107'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#444'; }}
                                        >
                                            <FaPlus size={10} /> Disponible
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </>
    );
};

export default MisCitasPage;