import React from 'react';
import styles from '@/styles/Modal.module.css'; // Reutilizamos estilos básicos de modal
import { FaPrint, FaWhatsapp, FaTimes, FaCheckCircle } from 'react-icons/fa';

interface TicketProps {
    data: {
        cliente: string;
        servicio: string;
        precio: number;
        barbero: string;
        fecha: string;
        hora: string;
        folio: number; // ID de la cita o venta
    };
    onClose: () => void;
}

const TicketModal: React.FC<TicketProps> = ({ data, onClose }) => {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '350px', padding: '0', background: 'white', color: 'black' }}>
                
                {/* CABECERA VISUAL DE APP (No sale en impresión si configuras CSS print) */}
                <div style={{ padding: '10px', background: '#222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold', display: 'flex', gap: 5, alignItems: 'center' }}>
                        <FaCheckCircle /> Cobro Exitoso
                    </span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaTimes /></button>
                </div>

                {/* EL TICKET IMPRIMIBLE */}
                <div id="printable-ticket" style={{ padding: '20px', fontFamily: "'Courier New', Courier, monospace", textAlign: 'center' }}>
                    
                    <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', fontSize: '1.2rem' }}>Barbería El Patrón</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>Calle Falsa 123, CDMX</p>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: '#555' }}>Tel: 55-1234-5678</p>
                    
                    <div style={{ borderBottom: '2px dashed black', margin: '10px 0' }}></div>

                    <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        <p style={{ margin: 0 }}><strong>Folio:</strong> #{data.folio}</p>
                        <p style={{ margin: 0 }}><strong>Fecha:</strong> {data.fecha} {data.hora}</p>
                        <p style={{ margin: 0 }}><strong>Barbero:</strong> {data.barbero}</p>
                        <p style={{ margin: 0 }}><strong>Cliente:</strong> {data.cliente}</p>
                    </div>

                    <div style={{ borderBottom: '2px dashed black', margin: '10px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', margin: '15px 0' }}>
                        <span>{data.servicio}</span>
                        <span>${data.precio}</span>
                    </div>

                    <div style={{ borderBottom: '2px dashed black', margin: '10px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: '900', marginTop: '10px' }}>
                        <span>TOTAL:</span>
                        <span>${data.precio}</span>
                    </div>

                    <p style={{ marginTop: '20px', fontSize: '0.8rem', fontStyle: 'italic' }}>¡Gracias por su preferencia!</p>
                </div>

                {/* BOTONES DE ACCIÓN (No salen en impresión idealmente) */}
                <div style={{ padding: '15px', background: '#f8f9fa', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handlePrint}
                        style={{ flex: 1, background: '#222', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                    >
                        <FaPrint /> Imprimir
                    </button>
                    <button 
                        onClick={() => alert("Función para compartir enlace del ticket")}
                        style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                    >
                        <FaWhatsapp /> Enviar
                    </button>
                </div>

            </div>
            
            {/* Estilos para impresión básica */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-ticket, #printable-ticket * { visibility: visible; }
                    #printable-ticket { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                    .modalBackdrop { background: white; }
                }
            `}</style>
        </div>
    );
};

export default TicketModal;