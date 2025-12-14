// src/components/DashboardSummary.tsx
import React from 'react';
import { FaDollarSign, FaCut, FaUsers, FaClock } from 'react-icons/fa';
import styles from '@/styles/Dashboard.module.css';
// Importamos el componente de la tarjeta que acabamos de arreglar
import DashboardMetricCard from './DashboardMetricCard';

interface DashboardSummaryProps {
    data: {
        totalRevenue: number;
        servicesCount: number;
        productsSoldCount: number;
        clientsAttended: number;
        proximaCita?: string;
    };
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ data }) => {
    return (
        <div className={styles.dailySummaryGrid}>
            <DashboardMetricCard
                title="Ingresos Hoy"
                value={`$${data.totalRevenue.toLocaleString()}`}
                icon={<FaDollarSign />}
                iconColorClass={styles.iconGreen}
                cardType="daily"
            />
            <DashboardMetricCard
                title="Servicios Hoy"
                value={data.servicesCount.toString()}
                icon={<FaCut />}
                iconColorClass={styles.iconBlue}
                cardType="daily"
            />
            <DashboardMetricCard
                title="Clientes Atendidos"
                value={data.clientsAttended.toString()}
                icon={<FaUsers />}
                iconColorClass={styles.iconPurple}
                cardType="daily"
            />
            <DashboardMetricCard
                title="Próxima Cita"
                value={data.proximaCita || "Sin citas"}
                icon={<FaClock />}
                iconColorClass={styles.iconOrange}
                cardType="daily"
            />
        </div>
    );
};

export default DashboardSummary;