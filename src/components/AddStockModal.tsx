// src/components/AddStockModal.tsx
import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes } from 'react-icons/fa';
import { Producto } from '@/types/index'; // 🔑 Importamos la interfaz central

interface AddStockModalProps {
  onClose: () => void;
  onStockUpdated: () => void;
  producto: Producto;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ onClose, onStockUpdated, producto }) => {
    // Inicia el estado con el stock actual
    const [newStock, setNewStock] = useState(producto.stock.toString());
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 🔑 Llamada al API PATCH que creamos
            const response = await fetch(`/api/inventario/${producto.id_prod}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStock: newStock }), 
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al actualizar stock');
            }
            
            setLoading(false);
            onStockUpdated(); // Refresca la lista
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
                    <h2 style={{ color: 'var(--color-primary)' }}>Actualizar Stock: {producto.nombre}</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="newStock">Nueva Cantidad de Stock (Actual: {producto.stock})</label>
                        <input
                            id="newStock"
                            name="newStock"
                            type="number"
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-primary)'}} disabled={loading}>
                            {loading ? 'Actualizando...' : 'Actualizar Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStockModal;