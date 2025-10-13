// src/pages/inventario/index.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar'; // ✅ Importación corregida (ruta absoluta)

const InventarioPlaceholder: NextPage = () => {
    return (
        <>
            <Head>
                <title>Inventario - Barbería Gestor</title>
            </Head>

            {/* ✅ CONTENEDOR FLEXBOX PARA EL LAYOUT (Sidebar a la izquierda, Contenido a la derecha) */}
            <div style={{ 
                display: 'flex', 
                minHeight: '100vh', 
                backgroundColor: '#12121e', /* Fondo oscuro general */
                color: '#f0f0f0' 
            }}>
                
                {/* 1. SECCIÓN DEL SIDEBAR */}
                <Sidebar currentModule="Inventario" />
                
                {/* 2. SECCIÓN DEL CONTENIDO PRINCIPAL */}
                <main style={{ 
                    flexGrow: 1, 
                    padding: '40px',
                    // Nota: Si quieres que el Sidebar tenga scroll propio, elimina el minHeight de aquí.
                }}>
                    
                    <h1>📦 Gestión de Inventario y Productos</h1>
                    <p style={{ marginTop: '10px', fontSize: '1.1em', color: '#999' }}>
                        Esta página está en desarrollo. El menú lateral ya está visible.
                    </p>

                    <div style={{ padding: '20px', marginTop: '30px', border: '1px solid #333', borderRadius: '8px' }}>
                        <h3 style={{color: '#E91E63'}}>ÁREA DE CONSTRUCCIÓN</h3>
                        <p>Usa este espacio para integrar el diseño de Inventario real (tarjetas y tabla).</p>
                    </div>

                </main>
            </div>
        </>
    );
};

export default InventarioPlaceholder;