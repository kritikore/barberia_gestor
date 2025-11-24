// src/components/SaleProductCard.tsx
import React from 'react';
import { FaCartPlus, FaBox } from 'react-icons/fa';

interface Producto {
    id_prod: number;
    nombre: string;
    marca: string;
    precio: number;
    stock: number;
}

interface SaleProductCardProps {
    producto: Producto;
    onAddToCart: (producto: Producto) => void;
}

const SaleProductCard: React.FC<SaleProductCardProps> = ({ producto, onAddToCart }) => {
    const sinStock = producto.stock === 0;

    return (
        <div style={{
            backgroundColor: '#2A2A2A',
            borderRadius: '12px',
            padding: '20px',
            border: sinStock ? '1px solid #DC3545' : '1px solid #444', // Borde rojo si no hay stock
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            opacity: sinStock ? 0.7 : 1,
            position: 'relative'
        }}>
            {/* Badge de Stock */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: sinStock ? '#DC3545' : '#28a745',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8em',
                fontWeight: 'bold'
            }}>
                {sinStock ? 'AGOTADO' : `${producto.stock} disp.`}
            </div>

            <div>
                <div style={{ color: 'var(--color-accent)', fontSize: '1.5em', marginBottom: '10px' }}>
                    <FaBox />
                </div>
                <h3 style={{ margin: '0 0 5px 0', color: 'white', fontSize: '1.1em' }}>{producto.nombre}</h3>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.9em' }}>{producto.marca}</p>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#4caf50' }}>
                    ${producto.precio.toFixed(2)}
                </span>
                
                <button
                    onClick={() => onAddToCart(producto)}
                    disabled={sinStock}
                    style={{
                        backgroundColor: sinStock ? '#555' : 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '6px',
                        cursor: sinStock ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 'bold'
                    }}
                >
                    <FaCartPlus /> Agregar
                </button>
            </div>
        </div>
    );
};

export default SaleProductCard;