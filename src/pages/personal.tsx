// src/pages/personal.tsx
import { useState } from 'react';

import { NextPage } from 'next';
import Head from 'next/head';
// ✅ Importaciones corregidas (usando alias absoluto)
import Sidebar from '@/components/Sidebar';
import styles from '@/styles/GlobalLayout.module.css';
import BarberoForm from '@/components/forms/formBarbero';





const PersonalPage: NextPage = () => {
    // Nombre del módulo para el título y el Sidebar
    const moduleName = "Personal";
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const toggleFormulario = () => {
        setMostrarFormulario(prev => !prev);
    };




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
                    <h1>🧑‍💼 {moduleName}</h1>
                    <p style={{ marginTop: '10px', fontSize: '1.1em', color: '#999' }}>
                        Módulo en desarrollo. Aquí irá el control de barberos, roles, comisiones y horarios.
                    </p>



                    <div style={{ padding: '20px', marginTop: '30px', border: '1px solid #333', borderRadius: '8px' }}>
                        <h3 style={{ color: '#E91E63' }}>ÁREA DE CONSTRUCCIÓN</h3>
                        <p>El contenido de la interfaz para la gestión del personal se implementará aquí.</p>
                        <p>Próximamente: Listado de barberos, asignación de roles, gestión de comisiones y horarios.</p>


                        {/* 🔘 Botón para mostrar/ocultar el formulario */}
                        <button
                            onClick={toggleFormulario}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            {mostrarFormulario ? 'Ocultar formulario' : '➕ Agregar barbero'}
                        </button>

                        {/* 🧾 Formulario condicional */}
                        {mostrarFormulario && <BarberoForm />}


                    </div>
                </main>
            </div>
        </>
    );
};

// ✅ Exportación por defecto obligatoria para Next.js
export default PersonalPage;