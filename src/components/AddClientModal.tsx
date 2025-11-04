// src/components/AddClientModal.tsx
import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css'; // Asegúrate de que este CSS exista
import { FaTimes } from 'react-icons/fa';

interface AddClientModalProps {
  onClose: () => void;
  onClientAdded: () => void;
}

// 🔑 CORRECCIÓN: export default en la declaración del componente
const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onClientAdded }) => {
    const [formData, setFormData] = useState({
        nom_clie: '',
        apell_clie: '',
        tel_clie: '',
        edad_clie: '',
        ocupacion: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 🔑 CORRECCIÓN: Limpiamos los datos con .trim() para eliminar espacios
        const cleanedData = {
            nom_clie: formData.nom_clie.trim(),
            apell_clie: formData.apell_clie.trim(),
            tel_clie: formData.tel_clie.trim(),
            edad_clie: formData.edad_clie,
            ocupacion: formData.ocupacion.trim(),
        };

        // Validaciones (usando datos limpios)
        if (cleanedData.tel_clie.length !== 10) {
            setError('El teléfono debe tener 10 dígitos.');
            setLoading(false);
            return;
        }
        if (!cleanedData.nom_clie || !cleanedData.apell_clie || !cleanedData.ocupacion) {
             setError('Nombre, Apellido y Ocupación no pueden estar vacíos.');
             setLoading(false);
             return;
        }

        try {
            // Enviamos los datos limpios al API
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanedData),
            });

            if (!response.ok) {
                const res = await response.json();
                // Mostramos el error de la DB si existe
                throw new Error(res.message || 'Error al guardar el cliente'); 
            }

            setLoading(false);
            onClientAdded(); // Refresca la lista
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
                    <h2>Añadir Nuevo Cliente</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FaTimes />
                    </button>
                </div>
                {/* 🔑 CORRECCIÓN: <form> ahora envuelve todo el formulario */}
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="nom_clie">Nombre(s)</label>
                            <input
                                id="nom_clie"
                                name="nom_clie"
                                type="text"
                                value={formData.nom_clie}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="apell_clie">Apellido(s)</label>
                            <input
                                id="apell_clie"
                                name="apell_clie"
                                type="text"
                                value={formData.apell_clie}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    {/* 🔑 CORRECCIÓN: Etiqueta </div> de cierre faltante */}
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="tel_clie">Teléfono (10 dígitos)</label>
                        <input
                            id="tel_clie"
                            name="tel_clie"
                            type="tel"
                            maxLength={10}
                            value={formData.tel_clie}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="edad_clie">Edad</label>
                            <input
                                id="edad_clie"
                                name="edad_clie"
                                type="number"
                                value={formData.edad_clie}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="ocupacion">Ocupación</label>
                            <input
                                id="ocupacion"
                                name="ocupacion"
                                type="text"
                                value={formData.ocupacion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    {/* 🔑 CORRECCIÓN: Etiqueta </div> de cierre faltante */}
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cliente'}
                        </button>
                    </div>
                {/* 🔑 CORRECCIÓN: Etiqueta </form> de cierre faltante */}
                </form>
            {/* 🔑 CORRECCIÓN: Etiqueta </div> de cierre faltante */}
            </div>
        {/* 🔑 CORRECCIÓN: Etiqueta </div> de cierre faltante */}
        </div>
    );
};

// 🔑 CORRECCIÓN: Faltaba el export default
export default AddClientModal;