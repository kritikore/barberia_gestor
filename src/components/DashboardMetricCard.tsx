// src/components/DashboardMetricCard.tsx
import React from 'react';
import styles from '@/styles/Dashboard.module.css'; // Importa el CSS del Dashboard

interface CardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    iconColorClass: string; // p.ej., styles.iconGreen
    cardType: 'daily' | 'monthly'; // Para cambiar el color de fondo
    comparison?: string;
    comparisonColor?: 'up' | 'down';
}

const DashboardMetricCard: React.FC<CardProps> = ({
    title,
    value,
    icon,
    iconColorClass,
    cardType,
    comparison,
    comparisonColor
}) => {

    const cardStyle = cardType === 'daily' ? styles.dailyCard : styles.monthlyCard;
    const comparisonStyle = comparisonColor === 'up' ? styles.comparisonUp : (comparisonColor === 'down' ? styles.comparisonDown : '');

    return (
        <div className={`${styles.metricCard} ${cardStyle}`}>
            <div className={styles.cardHeader}>
                <span className={`${styles.icon} ${iconColorClass}`}>
                    {icon}
                </span>
            </div>
            <div className={styles.cardContent}>
                <p className={styles.label}>{title}</p>
                <h2 className={styles.value}>{value}</h2>
            </div>
            {comparison && (
                <div className={styles.cardFooter}>
                    <span className={`${styles.comparison} ${comparisonStyle}`}>
                        {comparison}
                    </span>
                </div>
            )}
        </div>
    );
};

export default DashboardMetricCard;