// src/components/EditProductModal.tsx
import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css'; // Reutilizamos el CSS del modal
import { FaTimes } from 'react-icons/fa';
import { Producto } from '@/types/index'; // Importamos la interfaz

interface EditProductModalProps {
  onClose: () => void;
  onProductUpdated: () => void;
  producto: Producto;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ onClose, onProductUpdated, producto }) => {
    
    // 🔑 Inicia el formulario con los datos del producto que estamos editando
    const [formData, setFormData] = useState({
        nom_prod: producto.nombre,
        marc_prod: producto.marca,
        PRECIO_PROD: producto.precio.toString(),
        STOCK: producto.stock.toString(),
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            // 🔑 Llamada al API PUT que creamos (en /api/inventario/[id].ts)
            const response = await fetch(`/api/inventario/${producto.id_prod}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Enviamos todos los datos del formulario
                body: JSON.stringify(formData), 
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al editar el producto');
            }

            setLoading(false);
            onProductUpdated(); // Refresca la lista
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
                    <h2 style={{ color: 'var(--color-primary)' }}>Editar Producto</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    {/* 🔑 CAMPOS PARA EDITAR TODOS LOS DATOS */}
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
                        <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-primary)'}} disabled={loading}>
                            {loading ? 'Actualizando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;