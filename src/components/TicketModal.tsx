import React from 'react';
import { FaPrint, FaWhatsapp, FaTimes, FaCheckCircle } from 'react-icons/fa';

interface TicketProps {
    data: any; // Recibe los datos del corte
    onClose: () => void;
}

const TicketModal: React.FC<TicketProps> = ({ data, onClose }) => {
    if (!data) return null;

    // --- LÓGICA DE WHATSAPP ---
    const enviarPorWhatsApp = () => {
        // Intentamos obtener el teléfono de varias formas posibles
        const telefono = data.tel_clie || data.telefono || "";

        if (!telefono || telefono.length < 5) {
            return alert("Este cliente no tiene un teléfono registrado válido.");
        }

        // Limpiar número y agregar lada (Ej. 52 para México)
        const telLimpio = telefono.replace(/\D/g, '');
        const numeroFinal = telLimpio.length === 10 ? `52${telLimpio}` : telLimpio;

        const nombre = data.cliente || "Cliente";
        const servicio = data.servicio || "Servicio";
        const total = data.precio || 0;
        const folio = data.folio || "000";

        // Mensaje del recibo
        const mensaje = `🧾 *RECIBO DE PAGO* \nFolio: #${folio}\n\nHola *${nombre}*, gracias por tu visita.\n\n✂️ Servicio: ${servicio}\n💰 Total Pagado: $${total}\n\n¡Esperamos verte pronto! 💈`;

        const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    // --- LÓGICA DE IMPRESIÓN ---
    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', color: 'black', padding: '30px', borderRadius: '10px',
                width: '350px', textAlign: 'center', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
                {/* Botón Cerrar */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: 10, right: 10, background: 'none', 
                    border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666'
                }}>
                    <FaTimes />
                </button>

                {/* Icono Éxito */}
                <FaCheckCircle size={50} color="#28a745" style={{marginBottom: 15}}/>
                
                <h2 style={{margin: '0 0 10px 0'}}>¡Cobro Exitoso!</h2>
                <p style={{color: '#666', fontSize: '0.9rem', marginBottom: 20}}>El servicio ha sido registrado.</p>

                {/* TICKET VISUAL */}
                <div style={{
                    background: '#f8f9fa', padding: 15, borderRadius: 8, 
                    border: '1px dashed #ccc', marginBottom: 20, textAlign: 'left', fontSize: '0.9rem'
                }}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                        <strong>Folio:</strong> <span>#{data.folio}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                        <strong>Cliente:</strong> <span>{data.cliente}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                        <strong>Servicio:</strong> <span>{data.servicio}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                        <strong>Barbero:</strong> <span>{data.barbero}</span>
                    </div>
                    <hr style={{margin: '10px 0', border: 'none', borderTop: '1px solid #ddd'}}/>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize: '1.1rem'}}>
                        <strong>Total:</strong> <span style={{color:'#28a745', fontWeight:'bold'}}>${data.precio}</span>
                    </div>
                </div>

                {/* ACCIONES */}
                <div style={{display: 'flex', gap: 10}}>
                    <button 
                        onClick={handlePrint}
                        style={{
                            flex: 1, padding: '10px', border: '1px solid #ccc', background: 'white', 
                            color: '#333', borderRadius: 6, cursor: 'pointer', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 'bold'
                        }}
                    >
                        <FaPrint /> Imprimir
                    </button>

                    <button 
                        onClick={enviarPorWhatsApp} // 👈 AQUÍ LLAMAMOS A LA FUNCIÓN REAL
                        style={{
                            flex: 1, padding: '10px', border: 'none', background: '#25D366', 
                            color: 'white', borderRadius: 6, cursor: 'pointer', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 'bold'
                        }}
                    >
                        <FaWhatsapp size={18} /> WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;