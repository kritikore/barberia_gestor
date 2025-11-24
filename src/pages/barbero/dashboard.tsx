// src/pages/barbero/dashboard.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FaUserPlus, FaUsers, FaShoppingCart } from 'react-icons/fa';
// 🔑 Importamos el LAYOUT DE BARBERO
import BarberLayout from '@/components/BarberLayout'; 
import styles from '@/styles/BarberDashboard.module.css'; // Crearemos este CSS

const BarberDashboard: NextPage = () => {
    const barberoNombre = "Edgar RG"; // (Este dato debería venir del login)

    return (
        // 🔑 Envolvemos la página en el LAYOUT DE BARBERO
        <BarberLayout>
            <Head>
                <title>Dashboard del Barbero</title>
            </Head>
            
            <header className={styles.header}>
                <h1>Bienvenido, {barberoNombre}</h1>
                <p>¿Qué deseas hacer hoy?</p>
            </header>

            {/* Los 3 botones del prototipo [cite: 904-906] */}
            <div className={styles.actionsGrid}>
                <Link href="/barbero/registrar-cliente" className={styles.actionCard}>
                    <FaUserPlus />
                    <h2>Registrar Cliente</h2>
                    <p>Añadir un nuevo cliente a la bitácora.</p>
                </Link>

                <Link href="/barbero/clientes" className={styles.actionCard}>
                    <FaUsers />
                    <h2>Consultar Clientes</h2>
                    <p>Ver el historial y las preferencias.</p>
                </Link>

                <Link href="/barbero/ventas" className={styles.actionCard}>
                    <FaShoppingCart />
                    <h2>Registrar Venta</h2>
                    <p>Vender productos de inventario.</p>
                </Link>
            </div>
        </BarberLayout>
    );
};

export default BarberDashboard;