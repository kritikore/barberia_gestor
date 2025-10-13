// Ejemplo: src/pages/clientes.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar'; // Asegúrate de que la ruta de importación sea correcta
import styles from '../styles/GlobalLayout.module.css'; // Asume que tienes un layout base para el fondo

const ModuloPage: NextPage = () => {
    // 1. **CAMBIAR:** Módulo que se ilumina en el Sidebar
    const moduleName = "Clientes"; 

    return (
        <>
            <Head>
                {/* 2. **CAMBIAR:** Título de la página */}
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            {/* Asume que tu Sidebar está diseñado para un layout flexible */}
            <div className={styles.layoutContainer} style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#12121e', color: '#f0f0f0' }}>
                <Sidebar currentModule={moduleName} />
                
                <main style={{ flexGrow: 1, padding: '40px' }}>
                    
                    {/* 3. **CAMBIAR:** Encabezado y Descripción del Módulo */}
                    <h1>👥 {moduleName}</h1>
                    <p style={{ marginTop: '10px', fontSize: '1.1em', color: '#999' }}>
                        Módulo en desarrollo. Aquí se gestionarán los perfiles y el historial de los clientes.
                    </p>

                    <div style={{ padding: '20px', marginTop: '30px', border: '1px solid #333', borderRadius: '8px' }}>
                        <h3 style={{color: '#E91E63'}}>ÁREA DE CONSTRUCCIÓN</h3>
                        <p>El contenido real de la interfaz se implementará aquí.</p>
                    </div>

                </main>
            </div>
        </>
    );
};
export default ModuloPage;