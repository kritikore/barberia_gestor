// src/components/AddProductModal.tsx
import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css'; // Reutilizamos el CSS del modal
import { FaTimes } from 'react-icons/fa';

interface AddProductModalProps {
  onClose: () => void;
  onProductAdded: () => void; // Para refrescar la lista
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onProductAdded }) => {
    
    const [formData, setFormData] = useState({
        nom_prod: '',
        marc_prod: '',
        PRECIO_PROD: '',
        STOCK: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Limpiamos datos
        const cleanedData = {
            ...formData,
            nom_prod: formData.nom_prod.trim(),
            marc_prod: formData.marc_prod.trim(),
        };

        try {
            // 🔑 Llamada al API POST que creamos
            const response = await fetch('/api/inventario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanedData),
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al guardar el producto');
            }

            setLoading(false);
            onProductAdded(); // Refresca la lista
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
                    {/* 🔑 Título con color de acento (Amarillo) */}
                    <h2 style={{ color: 'var(--color-accent)' }}>Añadir Nuevo Producto</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="nom_prod">Nombre del Producto</label>
                            <input name="nom_prod" value={formData.nom_prod} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="marc_prod">Marca</label>
                            <input name="marc_prod" value={formData.marc_prod} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="PRECIO_PROD">Precio (Ej: 150.00)</label>
                            <input name="PRECIO_PROD" value={formData.PRECIO_PROD} onChange={handleChange} type="number" step="0.01" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="STOCK">Stock (Cantidad)</label>
                            <input name="STOCK" value={formData.STOCK} onChange={handleChange} type="number" required />
                        </div>
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        {/* 🔑 Botón principal usa el color de Acento (Amarillo) */}
                        <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }} disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;