import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { 
    FaCalendarAlt, FaTrash, FaEdit, FaPlus, 
    FaCheck, FaBan, FaDollarSign, FaUserTie, FaClock, FaUser, FaRegClock 
} from 'react-icons/fa'; 
import AddCitaModal from '@/components/AddCitaModal';
import EditCitaModal from '@/components/EditCitaModal';
import ReagendarModal from '@/components/ReagendarModal'; // 👈 IMPORTADO
import styles from '@/styles/Servicios.module.css';

const CitasAdminPage: NextPage = () => {
    const [citas, setCitas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const hoy = new Date().toLocaleDateString('en-CA'); 
    const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCita, setEditingCita] = useState<any | null>(null);
    const [citaParaReagendar, setCitaParaReagendar] = useState<any | null>(null); // 👈 NUEVO

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/citas');
            if (res.ok) {
                const data = await res.json();
                const citasDelDia = data.filter((c: any) => c.fecha.substring(0, 10) === fechaSeleccionada);
                setCitas(citasDelDia);
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [fechaSeleccionada]);

    const handleDelete = async (id: number) => {
        if (!confirm("¿Deseas eliminar esta cita y liberar el horario?")) return;
        try {
            await fetch(`/api/citas/${id}`, { method: 'DELETE' });
            fetchData();
        } catch(e) { alert("Error al eliminar"); }
    };

    const handleQuickStatus = async (id: number, nuevoEstado: string) => {
        if (!confirm(`¿Marcar como ${nuevoEstado}?`)) return;
        try {
            await fetch(`/api/citas/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ estado: nuevoEstado })
            });
            fetchData();
        } catch(e) { alert("Error al actualizar"); }
    };

    const intervalos = [];
    for (let hora = 9; hora <= 20; hora++) {
        intervalos.push(`${hora < 10 ? '0'+hora : hora}:00`);
        if (hora < 20) intervalos.push(`${hora < 10 ? '0'+hora : hora}:30`);
    }

    const getCitasEnHorario = (horario: string) => {
        return citas.filter(c => c.hora.substring(0, 5) === horario);
    };

    return (
        <>
            <Head><title>Agenda Global</title></Head>
            
            {isAddModalOpen && <AddCitaModal onClose={() => setIsAddModalOpen(false)} onSuccess={fetchData} />}
            {editingCita && <EditCitaModal cita={editingCita} onClose={() => setEditingCita(null)} onSuccess={fetchData} />}
            
            {/* MODAL REAGENDAR */}
            {citaParaReagendar && (
                <ReagendarModal 
                    cita={citaParaReagendar} 
                    onClose={() => setCitaParaReagendar(null)} 
                    onSuccess={fetchData} 
                />
            )}
            
            <main> 
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: 15 }}>
                    <h1 style={{margin:0, display:'flex', alignItems:'center'}}>
                        <FaCalendarAlt style={{ marginRight: '10px', color: 'var(--color-accent)' }} /> 
                        Agenda Global
                    </h1>
                    <div style={{display:'flex', gap: 15, alignItems:'center'}}>
                        <input type="date" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} style={{ background: '#222', color: 'white', border: '1px solid #444', padding: '10px', borderRadius: '8px', cursor: 'pointer' }} />
                        <button onClick={() => setIsAddModalOpen(true)} style={{ backgroundColor: 'var(--color-accent)', color: 'black', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaPlus /> Agendar
                        </button>
                    </div>
                </div>
                
                <div style={{background: '#1a1a1a', borderRadius: '16px', padding: '20px', border: '1px solid #333'}}>
                    {intervalos.map((horario) => {
                        const citasEnSlot = getCitasEnHorario(horario);
                        const esMediaHora = horario.includes(':30');

                        return (
                            <div key={horario} style={{ display: 'flex', borderBottom: '1px solid #333', minHeight: '80px', padding: '10px 0', backgroundColor: esMediaHora ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                <div style={{ width: '80px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: esMediaHora ? '#666' : '#aaa', fontWeight: esMediaHora ? 'normal' : 'bold' }}>
                                    {horario}
                                </div>

                                <div style={{flex: 1, paddingLeft: '15px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center'}}>
                                    {citasEnSlot.length > 0 ? (
                                        citasEnSlot.map((cita) => (
                                            <div key={cita.id_cita} style={{
                                                background: cita.estado === 'Completada' ? 'rgba(40, 167, 69, 0.1)' : 
                                                            cita.estado === 'No Asistió' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)', 
                                                borderLeft: `4px solid ${cita.estado === 'Completada' ? '#28a745' : cita.estado === 'No Asistió' ? '#dc3545' : '#ffc107'}`,
                                                width: '100%', padding: '10px 15px', borderRadius: '6px',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{fontWeight: 'bold', color: 'white', fontSize: '1.1em', marginBottom: 5, display:'flex', alignItems:'center', gap: 8}}>
                                                        <FaUser size={12} color="#aaa"/> {cita.nombre_cliente}
                                                    </div>
                                                    <div style={{color: '#aaa', fontSize: '0.9em', display: 'flex', gap: 15, alignItems:'center'}}>
                                                        <span style={{color: '#fff', fontWeight:'bold'}}>{cita.nombre_servicio}</span>
                                                        <span style={{display:'flex', alignItems:'center', gap:5, background: '#333', padding:'3px 8px', borderRadius:4, border: '1px solid #444', color: '#ccc', fontSize: '0.9em'}}>
                                                            <FaUserTie size={11} color="var(--color-accent)"/> Atiende: <strong>{cita.nombre_barbero}</strong>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                                                    <div style={{color: '#85ff9e', fontWeight: 'bold', fontSize: '1.1em', display: 'flex', alignItems: 'center'}}>
                                                        <FaDollarSign size={14}/> {cita.precio || 0}
                                                    </div>

                                                    <div style={{display:'flex', gap: 5, marginTop: 5}}>
                                                        
                                                        {/* BOTÓN REAGENDAR (NUEVO) */}
                                                        <button onClick={() => setCitaParaReagendar(cita)} title="Reagendar" style={{background:'#0D6EFD', border:'none', color:'white', padding:'6px', borderRadius:'4px', cursor:'pointer'}}>
                                                            <FaRegClock size={12}/>
                                                        </button>

                                                        {/* BOTÓN EDITAR COMPLETO (Se mantiene por si acaso) */}
                                                        <button onClick={() => setEditingCita(cita)} title="Editar Completo" style={{background:'#6610f2', border:'none', color:'white', padding:'6px', borderRadius:'4px', cursor:'pointer'}}>
                                                            <FaEdit size={12}/>
                                                        </button>

                                                        <button onClick={() => handleDelete(cita.id_cita)} title="Eliminar" style={{background:'#333', border:'1px solid #555', color:'#aaa', padding:'6px', borderRadius:'4px', cursor:'pointer'}}>
                                                            <FaTrash size={12}/>
                                                        </button>

                                                        {cita.estado === 'Pendiente' && (
                                                            <>
                                                                <button onClick={() => handleQuickStatus(cita.id_cita, 'No Asistió')} title="No Asistió" style={{background:'#dc3545', border:'none', color:'white', padding:'6px', borderRadius:'4px', cursor:'pointer'}}>
                                                                    <FaBan size={12}/>
                                                                </button>
                                                                <button onClick={() => handleQuickStatus(cita.id_cita, 'Completada')} title="Completar" style={{background:'#28a745', border:'none', color:'white', padding:'6px', borderRadius:'4px', cursor:'pointer'}}>
                                                                    <FaCheck size={12}/>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{color: '#444', fontStyle: 'italic', fontSize: '0.9em', border: '1px dashed #333', padding: '10px', borderRadius: '6px', textAlign:'center'}}>
                                            -- Disponible --
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

export default CitasAdminPage;