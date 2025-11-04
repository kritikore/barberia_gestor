// src/components/AddBarberModal.tsx
import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes } from 'react-icons/fa';

// Definimos la interfaz (simplificada) del Barbero
interface Barber {
    id_bar?: number;
    nom_bar: string;
    apell_bar: string;
    tel_bar: string;
    edad_bar: number;
    email: string;
    password?: string; // Opcional al editar
    posicion: string;
    estado: 'Activo' | 'Inactivo';
}

interface AddBarberModalProps {
  onClose: () => void;
  onSuccess: () => void;
  barberToEdit?: Barber | null; // Si se pasa este prop, el modal edita
}

const AddBarberModal: React.FC<AddBarberModalProps> = ({ onClose, onSuccess, barberToEdit }) => {
    
    const [formData, setFormData] = useState<Barber>({
        nom_bar: barberToEdit?.nom_bar || '',
        apell_bar: barberToEdit?.apell_bar || '',
        tel_bar: barberToEdit?.tel_bar || '',
        edad_bar: barberToEdit?.edad_bar || 18,
        email: barberToEdit?.email || '',
        password: '', // Siempre vacío por seguridad
        posicion: barberToEdit?.posicion || 'Barbero',
        estado: barberToEdit?.estado || 'Activo',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isEditing = !!barberToEdit; // Modo Edición si 'barberToEdit' existe

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Si estamos creando y la contraseña está vacía
        if (!isEditing && !formData.password) {
            setError('La contraseña es obligatoria al crear un nuevo barbero.');
            setLoading(false);
            return;
        }

        try {
            const url = isEditing ? `/api/personal/${barberToEdit.id_bar}` : '/api/personal';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), 
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al guardar el barbero');
            }

            setLoading(false);
            onSuccess(); // Refresca la lista
            onClose(); // Cierra el modal

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 style={{ color: 'var(--color-accent)' }}>
                        {isEditing ? 'Editar Barbero' : 'Añadir Nuevo Barbero'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Nombre(s)</label>
                            <input name="nom_bar" value={formData.nom_bar} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Apellido(s)</label>
                            <input name="apell_bar" value={formData.apell_bar} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className={styles.formGrid}>
                         <div className={styles.formGroup}>
                            <label>Teléfono</label>
                            <input name="tel_bar" value={formData.tel_bar} onChange={handleChange} required maxLength={10} />
                        </div>
                         <div className={styles.formGroup}>
                            <label>Edad</label>
                            <input name="edad_bar" value={formData.edad_bar} onChange={handleChange} type="number" required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email (para login)</label>
                        <input name="email" value={formData.email} onChange={handleChange} type="email" required />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contraseña</label>
                        <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Contraseña obligatoria'} />
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Posición</label>
                            <select name="posicion" value={formData.posicion} onChange={handleChange}>
                                <option value="Barbero">Barbero</option>
                                <option value="Barbero Senior">Barbero Senior</option>
                                <option value="Aprendiz">Aprendiz</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Estado</label>
                            <select name="estado" value={formData.estado} onChange={handleChange}>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }} disabled={loading}>
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Añadir Barbero')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBarberModal;