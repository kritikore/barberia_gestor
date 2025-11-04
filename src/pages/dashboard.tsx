// src/pages/dashboard.tsx

import React, { useEffect, useState } from 'react'; 
import { NextPage } from 'next';
import Head from 'next/head';
import DashboardMetricCard from '@/components/DashboardMetricCard';
import styles from '@/styles/Dashboard.module.css';
import { FaDollarSign, FaCut, FaUsers, FaClock, FaCalendarAlt, FaBoxOpen } from 'react-icons/fa';

interface DashboardMetrics {
    totalRevenue: number;
    servicesCount: number;
    productsSoldCount: number;
    clientsAttended: number;
}

const DashboardPage: NextPage = () => {
    
    // Estados para manejar datos reales
    const [data, setData] = useState<DashboardMetrics | null>(null); // Inicia como null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Llamada a la API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/dashboard/metrics'); 
                if (!response.ok) {
                    throw new Error('No se pudo cargar la información del servidor');
                }
                const apiData: DashboardMetrics = await response.json();
                setData(apiData); 
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false); 
            }
        };
        fetchData();
    }, []); 

    // ----------------------------------------------------
    // 🔑 CORRECCIÓN: MANEJO DE ESTADOS DE CARGA Y ERROR
    // ----------------------------------------------------
    
    // Si está cargando O si los datos aún no han llegado (son null), muestra "Cargando..."
    // Esto resuelve el error ts(18047) 'data' is possibly 'null'.
    if (loading || !data) { 
        return (
            <div className={styles.dashboardContainer} style={{ padding: '40px', color: 'white' }}>
                <h1 className={styles.title}>Cargando Panel de Control...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.dashboardContainer} style={{ padding: '40px' }}>
                <h1 className={styles.title} style={{ color: 'var(--color-danger, red)' }}>Error: {error}</h1>
            </div>
        );
    }
    
    // ----------------------------------------------------
    // DATOS SIMULADOS (Para "Métricas Generales")
    // ----------------------------------------------------
    const monthlyData = {
        ingresos: 24650,
        clientes: 1284,
        citas: 89,
        productos: 156 
    };

    // ----------------------------------------------------
    // RENDERIZADO CON DATOS REALES (Ahora 'data' está garantizado que no es 'null')
    // ----------------------------------------------------
    return (
        <>
            <Head>
                <title>Panel de Control - Barbería</title>
            </Head>
            <div className={styles.dashboardContainer}>
                {/* Encabezado */}
                <header className={styles.header}>
                    <h1 className={styles.title}>Panel de Control</h1>
                    <span className={styles.date}>Lunes, 22 de Septiembre de 2025</span>
                </header>

                {/* Sección 1: Resumen del Día (CON DATOS REALES DE LA DB) */}
                <h2 className={styles.sectionTitle}>Resumen del Día</h2>
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
                        value={"15:30"} // (Dato aún simulado)
                        icon={<FaClock />}
                        iconColorClass={styles.iconOrange}
                        cardType="daily"
                    />
                </div>

                {/* Sección 2: Métricas Generales (Aún simulado) */}
                <div className={styles.metricsGrid} style={{ marginTop: '30px' }}>
                    <DashboardMetricCard
                        title="Ingresos Mensual"
                        value={`$${monthlyData.ingresos.toLocaleString()}`}
                        icon={<FaDollarSign />}
                        iconColorClass={styles.iconGreen}
                        cardType="monthly"
                        comparison="+12.5% vs. ayer"
                        comparisonColor="up"
                    />
                    {/* ... (Otras tarjetas mensuales simuladas) ... */}
                </div>

                {/* Sección 3: Gráficos */}
                <div className={styles.chartsGrid}>
                    <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
                        <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>Ingresos y Servicios</h3>
                        <div className={styles.chartPlaceholder}>
                            (Área para el gráfico de barras/líneas)
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;