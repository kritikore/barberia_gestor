// src/components/ClientCard.tsx
import React from 'react';
import Link from 'next/link';
import { FaUser, FaPhone, FaArrowRight } from 'react-icons/fa';

export interface Cliente {
    id_clie: number;
    nom_clie: string;
    apell_clie: string;
    tel_clie: string;
    total_visitas?: number; // Opcional
}

interface ClientCardProps {
    cliente: Cliente;
    baseUrl?: string; 
}

const ClientCard: React.FC<ClientCardProps> = ({ cliente, baseUrl = "/barbero/clientes" }) => {
    
    const getInitials = (nombre: string, apellido: string) => {
        return (nombre?.[0] || '') + (apellido?.[0] || '');
    };

    // Validar que tengamos ID
    if (!cliente || !cliente.id_clie) {
        return null; // O un placeholder si prefieres
    }

    return (
        <div style={{
            backgroundColor: '#2A2A2A', 
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        }}>
            
            {/* SECCIÓN IZQUIERDA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#333',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    border: '2px solid var(--color-accent)' 
                }}>
                    {getInitials(cliente.nom_clie, cliente.apell_clie)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1em', color: '#fff', fontWeight: '600' }}>
                        {cliente.nom_clie} {cliente.apell_clie}
                    </h3>
                    <span style={{ fontSize: '0.9em', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <FaPhone size={10} /> {cliente.tel_clie}
                    </span>
                </div>
            </div>

            {/* SECCIÓN DERECHA: Botón Azul */}
            {/* 🔑 CORRECCIÓN: Aseguramos que la URL se construya correctamente */}
            <Link 
                href={`${baseUrl}/${cliente.id_clie}`} 
                style={{
                    backgroundColor: '#0D6EFD', 
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9em',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                }}
            >
                Ver <FaArrowRight size={12} />
            </Link>
        </div>
    );
};

export default ClientCard;