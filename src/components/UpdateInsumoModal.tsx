// src/components/UpdateInsumoModal.tsx
import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes } from 'react-icons/fa';
import { Insumo } from '@/pages/insumos'; // Importamos la interfaz de la página

interface UpdateInsumoModalProps {
  onClose: () => void;
  onInsumoUpdated: () => void;
  insumo: Insumo;
}

const UpdateInsumoModal: React.FC<UpdateInsumoModalProps> = ({ onClose, onInsumoUpdated, insumo }) => {
    
    // Inicia el estado con el stock actual
    const [newStock, setNewStock] = useState(insumo.stock.toString());
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 🔑 Llamada al API PATCH que crearemos
            const response = await fetch(`/api/insumos/${insumo.id_insu}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: parseInt(newStock, 10) }), 
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al actualizar stock');
            }
            
            setLoading(false);
            onInsumoUpdated(); // Refresca la lista
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
                    <h2 style={{ color: 'var(--color-primary)' }}>Actualizar Stock: {insumo.nom_insu}</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="newStock">Nueva Cantidad de Stock (Actual: {insumo.stock})</label>
                        <input
                            id="newStock"
                            name="newStock"
                            type="number"
                            min="0"
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

export default UpdateInsumoModal;