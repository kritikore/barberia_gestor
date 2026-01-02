import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaSave, FaUserTie, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';

interface Barbero {
    id_bar?: number;
    nom_bar: string;
    apell_bar: string;
    tel_bar: string;
    email: string;
    pass_bar?: string; // Opcional al editar
    estado: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    barberoToEdit: Barbero | null;
}

const BarberModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, barberoToEdit }) => {
    const [formData, setFormData] = useState<Barbero>({
        nom_bar: '', apell_bar: '', tel_bar: '', email: '', pass_bar: '', estado: 'Activo'
    });
    const [loading, setLoading] = useState(false);

    // Cargar datos si es edición
    useEffect(() => {
        if (barberoToEdit) {
            setFormData({
                ...barberoToEdit,
                pass_bar: '' // La contraseña no se muestra por seguridad
            });
        } else {
            setFormData({ nom_bar: '', apell_bar: '', tel_bar: '', email: '', pass_bar: '', estado: 'Activo' });
        }
    }, [barberoToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = barberoToEdit ? `/api/personal/${barberoToEdit.id_bar}` : '/api/personal';
            const method = barberoToEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(barberoToEdit ? "✅ Barbero actualizado" : "✅ Barbero creado exitosamente");
                onSuccess();
                onClose();
            } else {
                const err = await res.json();
                alert("Error: " + err.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{maxWidth:'500px'}}>
                <div className={styles.modalHeader}>
                    <h2 style={{color:'var(--color-accent)', display:'flex', alignItems:'center', gap:10}}>
                        <FaUserTie /> {barberoToEdit ? 'Editar Barbero' : 'Nuevo Barbero'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes/></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Nombre(s)</label>
                        <input 
                            className={styles.input} 
                            value={formData.nom_bar} 
                            onChange={e => setFormData({...formData, nom_bar: e.target.value})} 
                            required 
                            placeholder="Ej: Juan Carlos"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Apellidos</label>
                        <input 
                            className={styles.input} 
                            value={formData.apell_bar} 
                            onChange={e => setFormData({...formData, apell_bar: e.target.value})} 
                            required 
                            placeholder="Ej: Pérez López"
                        />
                    </div>

                    {/* CAMPO TELÉFONO AGREGADO */}
                    <div className={styles.formGroup}>
                        <label><FaPhone size={12}/> Teléfono</label>
                        <input 
                            className={styles.input} 
                            type="tel"
                            value={formData.tel_bar} 
                            onChange={e => setFormData({...formData, tel_bar: e.target.value})} 
                            required 
                            placeholder="Ej: 55 1234 5678"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label><FaEnvelope size={12}/> Email (Usuario de Acceso)</label>
                        <input 
                            className={styles.input} 
                            type="email"
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            required 
                            placeholder="juan@barberia.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label><FaLock size={12}/> {barberoToEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</label>
                        <input 
                            className={styles.input} 
                            type="password"
                            value={formData.pass_bar} 
                            onChange={e => setFormData({...formData, pass_bar: e.target.value})} 
                            required={!barberoToEdit} // Obligatoria solo al crear
                            placeholder={barberoToEdit ? "Dejar en blanco para mantener actual" : "Mínimo 6 caracteres"}
                        />
                    </div>

                    {barberoToEdit && (
                        <div className={styles.formGroup}>
                            <label>Estado</label>
                            <select 
                                className={styles.input} 
                                value={formData.estado} 
                                onChange={e => setFormData({...formData, estado: e.target.value})}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo (Baja Lógica)</option>
                            </select>
                        </div>
                    )}

                    <div className={styles.formActions} style={{marginTop:20}}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} disabled={loading} style={{background: 'var(--color-accent)', color:'black'}}>
                            <FaSave /> {loading ? 'Guardando...' : 'Guardar Datos'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BarberModal;