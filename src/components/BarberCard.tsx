// src/components/BarberCard.tsx
import React from 'react';
import styles from '@/styles/Personal.module.css';
import { FaPhone, FaEnvelope, FaCalendarAlt, FaStar, FaEdit, FaTrashAlt } from 'react-icons/fa';

// Interfaz para los datos que vienen de la API (incluye los JOINs)
interface BarberData {
    id_bar: number;
    nom_bar: string;
    apell_bar: string;
    tel_bar: string;
    email: string;
    estado: 'Activo' | 'Inactivo';
    posicion: string;
    fecha_contratacion: string;
    serviciosMes: string; // PostgreSQL devuelve count como string
    ingresosGenerados: string; // PostgreSQL devuelve sum como string
}

interface BarberCardProps {
  barber: BarberData;
  onEdit: () => void;
  onDelete: () => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber, onEdit, onDelete }) => {
    
    const getInitials = (nombre: string, apellido: string) => {
        return (nombre[0] || '') + (apellido[0] || '');
    };
    
    const formatDate = (dateString: string) => {
         return new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <div className={styles.barberCard}>
            {/* Encabezado: Avatar, Nombre, Acciones */}
            <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                    {getInitials(barber.nom_bar, barber.apell_bar)}
                </div>
                <div className={styles.headerInfo}>
                    <h3>{barber.nom_bar} {barber.apell_bar}</h3>
                </div>
                <div className={styles.headerActions}>
                    <button className={`${styles.actionButton} ${styles.editIcon}`} onClick={onEdit}>
                        <FaEdit />
                    </button>
                    <button className={`${styles.actionButton} ${styles.deleteIcon}`} onClick={onDelete}>
                        <FaTrashAlt />
                    </button>
                </div>
            </div>

            {/* Tags: Estado y Posición */}
            <div className={styles.tags}>
                <span className={`${styles.tag} ${barber.estado === 'Activo' ? styles.tagStatusActive : styles.tagStatusInactive}`}>
                    {barber.estado}
                </span>
                <span className={`${styles.tag} ${styles.tagPosition}`}>
                    {barber.posicion}
                </span>
            </div>

            {/* Detalles: Teléfono, Email, Fecha, Rating (Simulado) */}
            <div className={styles.detailsGrid}>
                <span><FaPhone /> {barber.tel_bar}</span>
                <span><FaEnvelope /> {barber.email}</span>
                <span><FaCalendarAlt /> Desde {formatDate(barber.fecha_contratacion)}</span>
                <span><FaStar /> 4.9/5.0</span>
            </div>

            {/* Footer: Estadísticas del Mes */}
            <div className={styles.statsFooter}>
                <div className={styles.stat}>
                    <h4>Servicios este mes</h4>
                    <p>{parseInt(barber.serviciosMes, 10)}</p>
                </div>
                 <div className={styles.stat}>
                    <h4>Ingresos generados</h4>
                    <p>${parseFloat(barber.ingresosGenerados).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export default BarberCard;