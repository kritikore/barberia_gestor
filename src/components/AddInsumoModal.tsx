// src/components/AddInsumoModal.tsx
import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes } from 'react-icons/fa';

interface AddInsumoModalProps {
  onClose: () => void;
  onInsumoAdded: () => void; 
}

const AddInsumoModal: React.FC<AddInsumoModalProps> = ({ onClose, onInsumoAdded }) => {
    
    // 🔑 CORRECCIÓN: Pedimos los campos de la tabla PRODUCTO
    const [formData, setFormData] = useState({
        nom_prod: '',
        marc_prod: '',
        STOCK: '1',
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
            // Llama al API de Insumos (que ahora guarda en PRODUCTO)
            const response = await fetch('/api/insumos', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom_prod: formData.nom_prod.trim(),
                    marc_prod: formData.marc_prod.trim(),
                    STOCK: parseInt(formData.STOCK, 10)
                }),
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al guardar el insumo');
            }

            setLoading(false);
            onInsumoAdded(); 
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
                    <h2 style={{ color: 'var(--color-accent)' }}>Añadir Nuevo Insumo</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="nom_prod">Nombre del Insumo (Ej: "Caja Navajas", "Botella Shampoo")</label>
                        <input name="nom_prod" value={formData.nom_prod} onChange={handleChange} required />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="marc_prod">Marca (Opcional)</label>
                        <input name="marc_prod" value={formData.marc_prod} onChange={handleChange} />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="STOCK">Cantidad Inicial (Unidades)</label>
                        <input name="STOCK" value={formData.STOCK} onChange={handleChange} type="number" min="0" required />
                    </div>
                    
                    <div className={styles.formActions}>
                        {/* ... (Botones Cancelar y Guardar) ... */}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInsumoModal;