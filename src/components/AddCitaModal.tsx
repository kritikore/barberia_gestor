// src/components/AddCitaModal.tsx
import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes } from 'react-icons/fa';

interface Cliente { id_clie: number; nom_clie: string; apell_clie: string; }
interface Barbero { id_bar: number; nom_bar: string; apell_bar: string; estado: string; }
interface Servicio { id_serv: number; tipo: string; }

interface AddCitaModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddCitaModal: React.FC<AddCitaModalProps> = ({ onClose, onSuccess }) => {
    
    // Estados para listas desplegables
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [barberos, setBarberos] = useState<Barbero[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    
    const [formData, setFormData] = useState({
        id_clie: '',
        id_bar: '',
        id_serv: '',
        fecha: '',
        hora: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔑 Cargar datos al abrir el modal
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [resCli, resBar, resServ] = await Promise.all([
                    fetch('/api/clientes'),
                    fetch('/api/personal'),
                    fetch('/api/servicios')
                ]);
                
                if(resCli.ok) setClientes(await resCli.json());
                
                if(resBar.ok) {
                    const allBarberos = await resBar.json();
                    // Solo barberos activos
                    setBarberos(allBarberos.filter((b: any) => b.estado === 'Activo'));
                }
                
                if(resServ.ok) setServicios(await resServ.json());

            } catch (err) {
                setError("Error cargando listas de datos.");
            }
        };
        loadDropdowns();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/citas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al guardar la cita');
            }

            // Éxito (Sin WhatsApp)
            setLoading(false);
            onSuccess(); 
            onClose(); 

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 style={{ color: 'var(--color-accent)' }}>Agendar Nueva Cita</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGroup}>
                        <label>Cliente</label>
                        <select name="id_clie" value={formData.id_clie} onChange={handleChange} required className={styles.input} style={{padding: '10px', width: '100%', background: '#1a1a1a', color: 'white', border: '1px solid #444'}}>
                            <option value="">Seleccione un cliente...</option>
                            {clientes.map(c => (
                                <option key={c.id_clie} value={c.id_clie}>{c.nom_clie} {c.apell_clie}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Barbero</label>
                        <select name="id_bar" value={formData.id_bar} onChange={handleChange} required className={styles.input} style={{padding: '10px', width: '100%', background: '#1a1a1a', color: 'white', border: '1px solid #444'}}>
                            <option value="">Seleccione un barbero...</option>
                            {barberos.map(b => (
                                <option key={b.id_bar} value={b.id_bar}>{b.nom_bar} {b.apell_bar}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Servicio</label>
                        <select name="id_serv" value={formData.id_serv} onChange={handleChange} required className={styles.input} style={{padding: '10px', width: '100%', background: '#1a1a1a', color: 'white', border: '1px solid #444'}}>
                            <option value="">Seleccione un servicio...</option>
                            {servicios.map(s => (
                                <option key={s.id_serv} value={s.id_serv}>{s.tipo}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Fecha</label>
                            <input name="fecha" value={formData.fecha} onChange={handleChange} type="date" required style={{padding: '10px', width: '100%', background: '#1a1a1a', color: 'white', border: '1px solid #444'}}/>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Hora</label>
                            <input name="hora" value={formData.hora} onChange={handleChange} type="time" step="1800" required style={{padding: '10px', width: '100%', background: '#1a1a1a', color: 'white', border: '1px solid #444'}}/>
                        </div>
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }} disabled={loading}>
                            {loading ? 'Agendando...' : 'Agendar Cita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCitaModal;