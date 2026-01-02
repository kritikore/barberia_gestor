import React, { useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaCheck, FaExclamationTriangle, FaCashRegister } from 'react-icons/fa';

interface Props {
    cita: any; // Datos de la cita (cliente, precio, servicio)
    onClose: () => void;
    onConfirm: (metodoPago: string, datosExtra?: any) => void;
}

const CheckoutModal: React.FC<Props> = ({ cita, onClose, onConfirm }) => {
    const [metodo, setMetodo] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
    
    // Estado para datos de tarjeta
    const [cardData, setCardData] = useState({ numero: '', titular: '', exp: '', cvv: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí enviamos el método y los datos al padre para que procese
        onConfirm(metodo, cardData);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                
                {/* HEADER */}
                <div className={styles.modalHeader}>
                    <h2 style={{color: 'white', margin:0}}>Cobrar Servicio</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>

                {/* RESUMEN DE VENTA */}
                <div style={{background: '#222', padding: 15, borderRadius: 8, marginBottom: 20, textAlign:'center'}}>
                    <div style={{fontSize: '0.9em', color: '#aaa'}}>Total a Pagar</div>
                    <div style={{fontSize: '2.5em', fontWeight: 'bold', color: '#4ade80'}}>${cita.precio}</div>
                    <div style={{fontSize: '1em', color: 'white'}}>{cita.nombre_servicio}</div>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* SELECCIÓN DE MÉTODO */}
                    <label style={{display:'block', marginBottom: 10, color:'#ccc'}}>Seleccione Método de Pago:</label>
                    <div style={{display: 'flex', gap: 10, marginBottom: 20}}>
                        <button type="button" onClick={() => setMetodo('EFECTIVO')} style={getButtonStyle(metodo === 'EFECTIVO')}>
                            <FaMoneyBillWave /> Efectivo
                        </button>
                        <button type="button" onClick={() => setMetodo('TARJETA')} style={getButtonStyle(metodo === 'TARJETA')}>
                            <FaCreditCard /> Tarjeta
                        </button>
                        <button type="button" onClick={() => setMetodo('TRANSFERENCIA')} style={getButtonStyle(metodo === 'TRANSFERENCIA')}>
                            <FaMobileAlt /> Transf.
                        </button>
                    </div>

                    {/* --- LÓGICA CONDICIONAL --- */}

                    {/* 1. EFECTIVO */}
                    {metodo === 'EFECTIVO' && (
                        <div style={{background: 'rgba(255, 193, 7, 0.1)', border: '1px solid #ffc107', padding: 15, borderRadius: 8, color: '#ffc107', display:'flex', alignItems:'center', gap: 15}}>
                            <FaCashRegister size={24} />
                            <div>
                                <strong>Abriendo Cajón de Dinero...</strong>
                                <div style={{fontSize: '0.8em', marginTop: 5}}>
                                    * Módulo de conexión con impresora/cajón en desarrollo.
                                    <br/>Por favor, realice el cobro manual e ingrese el efectivo.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. TARJETA (Formulario Real) */}
                    {metodo === 'TARJETA' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
                            <div className={styles.formGroup}>
                                <label>Número de Tarjeta</label>
                                <input 
                                    className={styles.input} 
                                    placeholder="0000 0000 0000 0000" 
                                    maxLength={19}
                                    value={cardData.numero}
                                    onChange={e => setCardData({...cardData, numero: e.target.value})}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Titular</label>
                                <input 
                                    className={styles.input} 
                                    placeholder="Nombre como aparece en la tarjeta" 
                                    value={cardData.titular}
                                    onChange={e => setCardData({...cardData, titular: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{display:'flex', gap: 10}}>
                                <div className={styles.formGroup} style={{flex:1}}>
                                    <label>Vencimiento</label>
                                    <input 
                                        className={styles.input} 
                                        placeholder="MM/YY" 
                                        maxLength={5}
                                        value={cardData.exp}
                                        onChange={e => setCardData({...cardData, exp: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup} style={{flex:1}}>
                                    <label>CVV</label>
                                    <input 
                                        className={styles.input} 
                                        placeholder="123" 
                                        maxLength={4}
                                        type="password"
                                        value={cardData.cvv}
                                        onChange={e => setCardData({...cardData, cvv: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. TRANSFERENCIA (Recordatorio) */}
                    {metodo === 'TRANSFERENCIA' && (
                        <div style={{background: 'rgba(13, 110, 253, 0.1)', border: '1px solid #0d6efd', padding: 15, borderRadius: 8, color: '#9ec5fe', display:'flex', alignItems:'center', gap: 15}}>
                            <FaExclamationTriangle size={24} />
                            <div>
                                <strong>Evidencia Requerida</strong>
                                <div style={{fontSize: '0.9em', marginTop: 5}}>
                                    Recuerde solicitar al cliente el comprobante y tomar captura de pantalla o foto para el <strong>Corte de Caja</strong>.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.formActions} style={{marginTop: 25}}>
                        <button type="submit" className={styles.submitButton} style={{width:'100%', background: '#28a745', fontSize:'1.1em'}}>
                            <FaCheck /> Confirmar Cobro
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

// Estilo dinámico para los botones de método
const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: isActive ? '2px solid var(--color-accent)' : '1px solid #444',
    background: isActive ? 'var(--color-accent)' : '#333',
    color: isActive ? 'black' : 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s'
});

export default CheckoutModal;