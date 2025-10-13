// src/components/MetricCard.tsx

import React, { ReactNode } from 'react';
import styles from '@/styles/Inventario.module.css';

// 🔑 Importamos los iconos específicos de Font Awesome que necesitamos
import { FaBox, FaExclamationTriangle, FaTimesCircle, FaDollarSign } from 'react-icons/fa';

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  // 🔑 El 'icono' ahora será un componente JSX real (ej: <FaBox />)
  icono: ReactNode; 
  claseColor: 'productos' | 'bajo' | 'sin_stock' | 'valor'; // Para estilos visuales
}

const MetricCard: React.FC<MetricCardProps> = ({ titulo, valor, icono, claseColor }) => {
  return (
    <div className={`${styles.metricCard} ${styles[claseColor]}`}>
      <div className={styles.metricIcon}>
        {/* 🔑 Renderizamos el componente de icono */}
        {icono}
      </div>
      <div className={styles.metricInfo}>
        <p className={styles.metricTitle}>{titulo}</p>
        <h2 className={styles.metricValue}>{valor}</h2>
      </div>
    </div>
  );
};

export default MetricCard;