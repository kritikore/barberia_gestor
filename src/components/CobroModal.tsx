// src/components/CobroModal.tsx
import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from 'react-icons/fa';

interface Cita {
    id_cita: number;
    nombre_cliente: string;
    nombre_servicio: string;
    // Suponemos que el precio viene de la cita o se busca
    precio_estimado?: number; 
}

interface CobroModalProps {
  cita: Cita;
  onClose: () => void;
  onConfirm: (metodoPago: string, propina: number, total: number) => void;
}

const CobroModal: React.FC<CobroModalProps> = ({ cita, onClose, onConfirm }) => {
    const precioBase = cita.precio_estimado || 250; // Precio base o simulado
    const [metodo, setMetodo] = useState('Efectivo');
    const [propina, setPropina] = useState(0);
    const [loading, setLoading] = useState(false);

    const total = precioBase + propina;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulamos proceso
        setTimeout(() => {
            onConfirm(metodo, propina, total);
        }, 1000);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 style={{ color: 'var(--color-primary)' }}>Terminar y Cobrar</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>

                <div style={{marginBottom: '20px', padding: '15px', background: '#222', borderRadius: '8px'}}>
                    <p style={{margin: '5px 0', color: '#aaa'}}>Cliente: <strong style={{color: 'white'}}>{cita.nombre_cliente}</strong></p>
                    <p style={{margin: '5px 0', color: '#aaa'}}>Servicio: <strong style={{color: 'white'}}>{cita.nombre_servicio}</strong></p>
                    <div style={{marginTop: '15px', fontSize: '1.5em', textAlign: 'right', color: 'var(--color-accent)', fontWeight: 'bold'}}>
                        ${total.toFixed(2)}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Método de Pago</label>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                            <button type="button" onClick={() => setMetodo('Efectivo')} style={{padding: '10px', border: metodo === 'Efectivo' ? '2px solid var(--color-accent)' : '1px solid #444', background: '#333', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                                <FaMoneyBillWave /> Efectivo
                            </button>
                            <button type="button" onClick={() => setMetodo('Tarjeta')} style={{padding: '10px', border: metodo === 'Tarjeta' ? '2px solid var(--color-accent)' : '1px solid #444', background: '#333', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                                <FaCreditCard /> Tarjeta
                            </button>
                            <button type="button" onClick={() => setMetodo('Transferencia')} style={{padding: '10px', border: metodo === 'Transferencia' ? '2px solid var(--color-accent)' : '1px solid #444', background: '#333', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                                <FaExchangeAlt /> Transf.
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Propina (Opcional)</label>
                        <input 
                            type="number" 
                            value={propina} 
                            onChange={(e) => setPropina(parseFloat(e.target.value) || 0)} 
                            className={styles.input}
                            style={{padding: '10px', width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white'}}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} disabled={loading} style={{backgroundColor: 'var(--color-accent)', color: 'black', width: '100%'}}>
                            {loading ? 'Procesando...' : 'Confirmar Cobro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CobroModal;