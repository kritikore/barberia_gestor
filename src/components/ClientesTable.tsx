// src/components/ClientesTable.tsx

import React from 'react';
import styles from '@/styles/Clientes.module.css';
import { useRouter } from 'next/router'; // 🔑 1. Importar el hook de enrutamiento

// Interfaz Cliente (Asegúrate de que coincida)
export interface Cliente {
    id_clie: number;
    nombre: string;
    telefono: string;
    ultimaVisita: string; 
    totalServicios: number;
    gastoTotal: number;
}

interface ClientesTableProps {
    clientes: Cliente[];
}

const ClientesTable: React.FC<ClientesTableProps> = ({ clientes }) => {
    
    const router = useRouter(); // 🔑 2. Inicializar el router

    // 🔑 3. Actualizar la función para navegar
    const handleViewProfile = (id: number) => {
        // alert(`Ver historial del Cliente ID: ${id}`); <-- Ya no usamos alert
        router.push(`/clientes/${id}`); // Navega a la página de perfil
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.clientesTable}>
                {/* ... (thead se mantiene igual) ... */}
                <tbody>
                    {clientes.map((cliente) => (
                        <tr key={cliente.id_clie}>
                            <td>{cliente.nombre}</td>
                            <td>{cliente.telefono}</td>
                            <td>{cliente.ultimaVisita}</td>
                            <td>{cliente.totalServicios}</td>
                            <td>${cliente.gastoTotal.toFixed(2)}</td>
                            <td className={styles.tableActionCell}>
                                <button 
                                    className={styles.viewButton} 
                                    onClick={() => handleViewProfile(cliente.id_clie)}
                                >
                                    Ver Perfil
                                </button>
                            </td>
                        </tr>
                    ))}
                    {clientes.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                No se encontraron clientes.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClientesTable;