import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaSave, FaCalendarAlt, FaClock, FaUser, FaCut, FaEdit } from 'react-icons/fa';

interface Barbero { id_bar: number; nom_bar: string; apell_bar: string; estado: string; }
interface Servicio { id_serv: number; tipo: string; }
interface CitaData {
    id_cita: number;
    id_bar: number;
    id_serv: number;
    fecha: string;
    hora: string;
    estado: string;
    nombre_cliente: string;
}

interface Props {
    cita: CitaData;
    onClose: () => void;
    onSuccess: () => void;
}

const EditCitaModal: React.FC<Props> = ({ cita, onClose, onSuccess }) => {
    const [barberos, setBarberos] = useState<Barbero[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id_bar: cita.id_bar,
        id_serv: cita.id_serv,
        fecha: new Date(cita.fecha).toISOString().split('T')[0],
        hora: cita.hora,
        estado: cita.estado,
        observaciones: 'Editado por Admin'
    });

    useEffect(() => {
        const loadCatalogos = async () => {
            try {
                const [resBar, resServ] = await Promise.all([
                    fetch('/api/personal'),
                    fetch('/api/servicios')
                ]);
                if (resBar.ok) {
                    const allBarberos = await resBar.json();
                    setBarberos(allBarberos.filter((b: Barbero) => b.estado === 'Activo'));
                }
                if (resServ.ok) setServicios(await resServ.json());
            } catch (e) { console.error(e); }
        };
        loadCatalogos();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/citas/${cita.id_cita}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Error al actualizar");

            alert("✅ Cita actualizada");
            onSuccess();
            onClose();
        } catch (error) {
            alert("Error al guardar los cambios.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 style={{color: 'var(--color-accent)', display:'flex', gap:10, alignItems:'center'}}>
                        <FaEdit /> Editar Cita #{cita.id_cita}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes/></button>
                </div>

                <div style={{background: '#222', padding: 10, borderRadius: 6, marginBottom: 20, borderLeft: '4px solid var(--color-accent)'}}>
                    <strong style={{color: '#aaa'}}>Cliente:</strong> 
                    <span style={{color: 'white', marginLeft: 8, fontSize: '1.1em'}}>{cita.nombre_cliente}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label><FaCalendarAlt/> Fecha</label>
                            <input type="date" className={styles.input} value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label><FaClock/> Hora</label>
                            <input type="time" className={styles.input} value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label><FaUser/> Barbero Asignado</label>
                        <select className={styles.input} value={formData.id_bar} onChange={e => setFormData({...formData, id_bar: Number(e.target.value)})}>
                            {barberos.map(b => (
                                <option key={b.id_bar} value={b.id_bar}>{b.nom_bar} {b.apell_bar}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label><FaCut/> Servicio</label>
                        <select className={styles.input} value={formData.id_serv} onChange={e => setFormData({...formData, id_serv: Number(e.target.value)})}>
                            {servicios.map(s => (
                                <option key={s.id_serv} value={s.id_serv}>{s.tipo}</option>
                            ))}
                        </select>
                    </div>

                    {/* ESTADOS ESTANDARIZADOS */}
                    <div className={styles.formGroup}>
                        <label>Estado de la Cita</label>
                        <select className={styles.input} style={{border: '1px solid var(--color-accent)'}} value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                            <option value="Pendiente">🟡 Pendiente</option>
                            <option value="Completada">🔵 Completada</option>
                            <option value="No Asistió">🔴 No Asistió</option>
                        </select>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} disabled={loading} style={{background: '#0D6EFD', color: 'white'}}>
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCitaModal;