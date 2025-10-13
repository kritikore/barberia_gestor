// src/pages/dashboard.tsx

import { NextPage } from 'next';
import Head from 'next/head';
// ✅ Importaciones corregidas (usando alias absoluto)
import Sidebar from '@/components/Sidebar'; 
import styles from '@/styles/GlobalLayout.module.css'; 

const DashboardPage: NextPage = () => {
    // Nombre del módulo para el título y el Sidebar
    const moduleName = "Dashboard"; 

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            {/* ✅ LAYOUT CONTENEDOR (usando la clase del CSS Module) */}
            <div className={styles.layoutContainer}> 
                
                <Sidebar currentModule={moduleName} />
                
                {/* ✅ CONTENIDO PRINCIPAL (usando la clase del CSS Module) */}
                <main className={styles.mainContent}> 
                    <h1>🏠 {moduleName}</h1>
                    <p style={{ marginTop: '10px', fontSize: '1.1em', color: '#999' }}>
                        Esta es la vista principal del Administrador. Aquí se mostrarán las métricas clave y resúmenes diarios/mensuales.
                    </p>

                    <div style={{ padding: '20px', marginTop: '30px', border: '1px solid #333', borderRadius: '8px' }}>
                        <h3 style={{color: '#E91E63'}}>ÁREA DE CONSTRUCCIÓN</h3>
                        <p>Aquí irá el diseño de las tarjetas de métricas (ingresos, citas, stock bajo, etc.) según el prototipo inicial.</p>
                    </div>
                </main>
            </div>
        </>
    );
};

// ✅ Exportación por defecto obligatoria para Next.js
export default DashboardPage;