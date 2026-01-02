import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaSave } from 'react-icons/fa';
import { useBarbero } from '@/hooks/useBarbero';

interface Cliente { id_clie: number; nom_clie: string; apell_clie: string; id_bar: number; }
interface Barbero { id_bar: number; nom_bar: string; apell_bar: string; estado: string; }
interface Servicio { id_serv: number; tipo: string; precio: number; }

interface AddCitaModalProps {
  onClose: () => void;
  onSuccess: () => void;
  preSelectedClientId?: number;
  preSelectedClientName?: string;
  // 👇 NUEVOS PROPS
  preSelectedDate?: string;
  preSelectedTime?: string;
}

const AddCitaModal: React.FC<AddCitaModalProps> = ({ 
    onClose, onSuccess, 
    preSelectedClientId, preSelectedClientName,
    preSelectedDate, preSelectedTime 
}) => {
    
    const { barbero: sessionBarbero } = useBarbero();

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [barberos, setBarberos] = useState<Barbero[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    
    const [formData, setFormData] = useState({
        id_clie: preSelectedClientId ? String(preSelectedClientId) : '', 
        id_bar: '', 
        id_serv: '',
        // 👇 USAMOS LOS VALORES PRE-SELECCIONADOS SI EXISTEN
        fecha: preSelectedDate || new Date().toLocaleDateString('en-CA'),
        hora: preSelectedTime || '', 
    });

    const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
    const [buscandoHorarios, setBuscandoHorarios] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Sincronizar Barbero Logueado
    useEffect(() => {
        if (sessionBarbero && sessionBarbero.id_bar) {
            setFormData(prev => ({ ...prev, id_bar: String(sessionBarbero.id_bar) }));
        }
    }, [sessionBarbero]);

    // Carga de Listas
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const promises = [fetch('/api/servicios'), fetch('/api/personal')];
                if (!preSelectedClientId) promises.push(fetch('/api/clientes'));

                const results = await Promise.all(promises);
                
                if (results[0].ok) setServicios(await results[0].json());
                
                if (results[1].ok) {
                     const allBarberos = await results[1].json();
                     setBarberos(allBarberos.filter((b: any) => b.estado === 'Activo'));
                }

                if (!preSelectedClientId && results[2] && results[2].ok) {
                    const allClientes = await results[2].json();
                    
                    // 🔒 FILTRO DE SEGURIDAD:
                    // Si hay un barbero logueado, solo mostramos SUS clientes en el select.
                    if (sessionBarbero) {
                        const misClientes = allClientes.filter((c: any) => Number(c.id_bar) === Number(sessionBarbero.id_bar));
                        setClientes(misClientes);
                    } else {
                        setClientes(allClientes); // Si es admin, ve todos
                    }
                }
            } catch (err) { console.error(err); setError("Error cargando listas."); }
        };
        loadDropdowns();
    }, [preSelectedClientId, sessionBarbero]);

    // Matriz de Disponibilidad
    useEffect(() => {
        const checkDisponibilidad = async () => {
            if (!formData.id_bar || !formData.fecha) return;

            setBuscandoHorarios(true);
            try {
                const res = await fetch('/api/citas');
                if (res.ok) {
                    const todasLasCitas = await res.json();
                    const citasDelDia = todasLasCitas.filter((c: any) => 
                        String(c.id_bar) === String(formData.id_bar) &&
                        c.fecha.substring(0, 10) === formData.fecha &&
                        c.estado !== 'Cancelada' && c.estado !== 'No Asistió'
                    );
                    setHorariosOcupados(citasDelDia.map((c: any) => c.hora.substring(0, 5)));
                }
            } catch (error) { console.error(error); }
            finally { setBuscandoHorarios(false); }
        };
        checkDisponibilidad();
    }, [formData.id_bar, formData.fecha]);

    const generarBloquesHorarios = () => {
        const bloques = [];
        for (let hora = 9; hora <= 20; hora++) {
            bloques.push(`${hora < 10 ? '0' + hora : hora}:00`);
            if (hora < 20) bloques.push(`${hora < 10 ? '0' + hora : hora}:30`);
        }
        return bloques;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.hora) return setError("Selecciona un horario.");
        setLoading(true);
        try {
            const response = await fetch('/api/citas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });
            if (!response.ok) throw new Error('Error al guardar');
            onSuccess(); onClose(); 
        } catch (err: any) { setError(err.message); setLoading(false); }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{maxWidth: '600px'}}>
                <div className={styles.modalHeader}>
                    <h2 style={{ color: 'var(--color-accent)' }}>Agendar Cita</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGroup}>
                        <label>Cliente (Mi Cartera)</label>
                        {preSelectedClientName ? (
                            <input type="text" value={preSelectedClientName} disabled className={styles.input} style={{background: '#333', color: '#aaa', fontWeight: 'bold'}} />
                        ) : (
                            <select name="id_clie" value={formData.id_clie} onChange={handleChange} required className={styles.input}>
                                <option value="">Seleccione un cliente...</option>
                                {clientes.map(c => <option key={c.id_clie} value={c.id_clie}>{c.nom_clie} {c.apell_clie}</option>)}
                            </select>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Servicio</label>
                        <select name="id_serv" value={formData.id_serv} onChange={handleChange} required className={styles.input}>
                            <option value="">Seleccione servicio...</option>
                            {servicios.map(s => <option key={s.id_serv} value={s.id_serv}>{s.tipo} - ${s.precio}</option>)}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Fecha</label>
                        <input name="fecha" value={formData.fecha} onChange={handleChange} type="date" required className={styles.input} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Horarios {buscandoHorarios && <small>...</small>}</label>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', marginTop: '5px'}}>
                            {generarBloquesHorarios().map(hora => {
                                const ocupado = horariosOcupados.includes(hora);
                                const seleccionado = formData.hora === hora;
                                return (
                                    <button
                                        key={hora} type="button" disabled={ocupado}
                                        onClick={() => setFormData({...formData, hora})}
                                        style={{
                                            padding: '8px 5px', borderRadius: '6px',
                                            border: seleccionado ? '2px solid var(--color-accent)' : '1px solid #444',
                                            background: ocupado ? '#2a1a1a' : seleccionado ? 'rgba(255, 193, 7, 0.2)' : '#1a1a1a',
                                            color: ocupado ? '#555' : seleccionado ? 'var(--color-accent)' : 'white',
                                            cursor: ocupado ? 'not-allowed' : 'pointer',
                                            textDecoration: ocupado ? 'line-through' : 'none'
                                        }}
                                    >
                                        {hora}
                                    </button>
                                )
                            })}
                        </div>
                        <input type="hidden" name="hora" value={formData.hora} required />
                    </div>
                    
                    <div className={styles.formActions} style={{marginTop: 20}}>
                        <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-accent)', color: 'black', width:'100%' }} disabled={loading}>
                            <FaSave /> {loading ? 'Agendando...' : 'Confirmar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCitaModal;