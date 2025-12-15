import React from 'react';
import { FaUser, FaPhone, FaEnvelope, FaTrash } from 'react-icons/fa';
import styles from '@/styles/Servicios.module.css'; // Usamos tus estilos corregidos
import { Cliente } from '@/hooks/useClientes';

interface Props {
    clientes: Cliente[];
    loading: boolean;
    onDelete: (id: number) => void;
    // Podrías agregar onEdit aquí en el futuro
}

const ClientsTable: React.FC<Props> = ({ clientes, loading, onDelete }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.serviciosTable}>
                <thead>
                    <tr>
                        <th style={{width: '80px', textAlign: 'center'}}>Foto</th>
                        <th>Nombre Completo</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Ocupación</th>
                        <th style={{textAlign: 'center'}}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '30px', color: '#aaa'}}>Cargando clientes...</td></tr>
                    ) : (
                        clientes.map((cliente) => (
                            <tr key={cliente.id_clie}>
                                {/* FOTO */}
                                <td style={{textAlign: 'center'}}>
                                    {cliente.foto_base64 ? (
                                        <img 
                                            src={`data:image/jpeg;base64,${cliente.foto_base64}`} 
                                            alt="Avatar" 
                                            style={{width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)'}}
                                        />
                                    ) : (
                                        <div style={{width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>
                                            <FaUser size={20} color="#666" />
                                        </div>
                                    )}
                                </td>

                                {/* DATOS */}
                                <td>
                                    <div style={{fontWeight: 'bold', color: 'white', fontSize: '1.05em'}}>
                                        {cliente.nom_clie} {cliente.apell_clie}
                                    </div>
                                </td>
                                <td>
                                    <div style={{display:'flex', alignItems:'center', gap:8, color: '#ccc'}}>
                                        <FaPhone size={12} color="var(--color-accent)"/>
                                        {cliente.tel_clie}
                                    </div>
                                </td>
                                <td>
                                    {cliente.email_clie ? (
                                        <div style={{display:'flex', alignItems:'center', gap:8, color: '#aaa'}}>
                                            <FaEnvelope size={12}/> {cliente.email_clie}
                                        </div>
                                    ) : <span style={{color: '#666', fontStyle: 'italic'}}>No registrado</span>}
                                </td>
                                <td style={{color: '#aaa'}}>{cliente.ocupacion || '-'}</td>

                                {/* ACCIONES */}
                                <td className={styles.actionCell}>
                                    <button 
                                        className={styles.actionButton} 
                                        style={{color: '#dc3545', border: '1px solid #dc3545'}} 
                                        onClick={() => onDelete(cliente.id_clie)} 
                                        title="Eliminar Cliente"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    {!loading && clientes.length === 0 && (
                        <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px', color: '#666'}}>No hay clientes registrados.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClientsTable;