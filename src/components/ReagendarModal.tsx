import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaSave, FaClock, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

interface Props {
    cita: any; // Debe incluir id_cita, id_bar, fecha, hora, nombre_cliente, nombre_barbero
    onClose: () => void;
    onSuccess: () => void;
}

const ReagendarModal: React.FC<Props> = ({ cita, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    // Estados del formulario
    // Ajustamos la fecha inicial para asegurar formato YYYY-MM-DD
    const [fechaSeleccionada, setFechaSeleccionada] = useState(
        new Date(cita.fecha).toISOString().split('T')[0]
    );
    const [horaSeleccionada, setHoraSeleccionada] = useState(cita.hora.substring(0, 5));
    
    // Estado de disponibilidad
    const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
    const [buscando, setBuscando] = useState(false);

    // 1. DETECTAR DISPONIBILIDAD (Del barbero asignado)
    useEffect(() => {
        const checkDisponibilidad = async () => {
            setBuscando(true);
            try {
                const res = await fetch('/api/citas');
                if (res.ok) {
                    const todas = await res.json();
                    
                    // Filtramos citas que:
                    // 1. Sean del MISMO barbero de la cita original
                    // 2. Sean en la NUEVA fecha seleccionada
                    // 3. NO sean la cita actual (para no bloquearse a sí mismo)
                    // 4. Estén activas (no canceladas)
                    const ocupadas = todas.filter((c: any) => 
                        Number(c.id_bar) === Number(cita.id_bar) &&
                        c.fecha.substring(0, 10) === fechaSeleccionada &&
                        Number(c.id_cita) !== Number(cita.id_cita) && 
                        c.estado !== 'Cancelada' &&
                        c.estado !== 'No Asistió'
                    );

                    setHorariosOcupados(ocupadas.map((c: any) => c.hora.substring(0, 5)));
                }
            } catch (error) {
                console.error("Error buscando disponibilidad", error);
            } finally {
                setBuscando(false);
            }
        };

        checkDisponibilidad();
    }, [fechaSeleccionada, cita.id_bar, cita.id_cita]);

    // 2. GENERAR BLOQUES DE 30 MIN
    const generarBloques = () => {
        const bloques = [];
        for (let h = 9; h <= 20; h++) {
            bloques.push(`${h < 10 ? '0'+h : h}:00`);
            if (h < 20) bloques.push(`${h < 10 ? '0'+h : h}:30`);
        }
        return bloques;
    };

    // 3. GUARDAR CAMBIOS
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/citas/${cita.id_cita}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fecha: fechaSeleccionada,
                    hora: horaSeleccionada
                    // Nota: No enviamos id_bar ni id_serv, solo movemos el tiempo
                }) 
            });

            if (res.ok) {
                alert("✅ Cita reagendada con éxito");
                onSuccess();
                onClose();
            } else {
                const err = await res.json();
                alert("Error: " + (err.message || "No se pudo reagendar"));
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{maxWidth: '500px'}}>
                
                {/* HEADER */}
                <div className={styles.modalHeader}>
                    <h3 style={{margin:0, display:'flex', alignItems:'center', gap:10, color:'var(--color-accent)'}}>
                        <FaClock /> Reagendar Cita
                    </h3>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes/></button>
                </div>

                {/* RESUMEN INFORMATIVO */}
                <div style={{background:'#222', padding:15, borderRadius:8, marginBottom:20, borderLeft:'4px solid var(--color-accent)'}}>
                    <div style={{color:'white', fontWeight:'bold', fontSize:'1.1em', marginBottom:5}}>
                        {cita.nombre_cliente}
                    </div>
                    <div style={{display:'flex', gap:15, color:'#aaa', fontSize:'0.9em'}}>
                        <span style={{display:'flex', alignItems:'center', gap:5}}>
                            <FaUserTie /> {cita.nombre_barbero || 'Barbero'}
                        </span>
                        <span>•</span>
                        <span>{cita.nombre_servicio}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* SELECCIÓN DE FECHA */}
                    <div className={styles.formGroup}>
                        <label><FaCalendarAlt/> Nueva Fecha</label>
                        <input 
                            type="date" 
                            className={styles.input} 
                            value={fechaSeleccionada} 
                            onChange={e => setFechaSeleccionada(e.target.value)} 
                            required 
                        />
                    </div>

                    {/* MATRIZ DE HORARIOS (Igual que AddCitaModal) */}
                    <div className={styles.formGroup}>
                        <label style={{display:'flex', justifyContent:'space-between'}}>
                            <span>Disponibilidad de {cita.nombre_barbero?.split(' ')[0]}</span>
                            {buscando && <small style={{color:'#ffc107'}}>Buscando huecos...</small>}
                        </label>
                        
                        <div style={{
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', 
                            gap: '8px', 
                            marginTop: '10px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            paddingRight: '5px' // espacio para scrollbar
                        }}>
                            {generarBloques().map(hora => {
                                const ocupado = horariosOcupados.includes(hora);
                                const seleccionado = horaSeleccionada === hora;
                                
                                return (
                                    <button
                                        key={hora}
                                        type="button"
                                        disabled={ocupado}
                                        onClick={() => setHoraSeleccionada(hora)}
                                        style={{
                                            padding: '8px 0',
                                            borderRadius: '6px',
                                            border: seleccionado ? '2px solid var(--color-accent)' : '1px solid #444',
                                            background: ocupado ? '#2a1a1a' : seleccionado ? 'rgba(255, 193, 7, 0.2)' : '#1a1a1a',
                                            color: ocupado ? '#555' : seleccionado ? 'var(--color-accent)' : 'white',
                                            cursor: ocupado ? 'not-allowed' : 'pointer',
                                            textDecoration: ocupado ? 'line-through' : 'none',
                                            fontSize: '0.9em',
                                            fontWeight: seleccionado ? 'bold' : 'normal',
                                            transition: 'all 0.2s',
                                            opacity: ocupado ? 0.6 : 1
                                        }}
                                    >
                                        {hora}
                                    </button>
                                )
                            })}
                        </div>
                        <input type="hidden" required value={horaSeleccionada} />
                    </div>

                    <div className={styles.formActions} style={{marginTop:20}}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} disabled={loading} style={{background: '#0D6EFD', width:'100%', display:'flex', justifyContent:'center', alignItems:'center', gap:8}}>
                            <FaSave /> Confirmar Nuevo Horario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReagendarModal;