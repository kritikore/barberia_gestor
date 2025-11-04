// src/components/DashboardSummary.tsx

import React from 'react';
// Asegúrate de tener instaladas las react-icons: npm install react-icons
import { FaDollarSign, FaCut, FaBox, FaUserFriends } from 'react-icons/fa'; 

// Componente individual de tarjeta de resumen
const SummaryCard: React.FC<{ title: string, value: string, icon: React.ReactNode, iconColor: string }> = ({ title, value, icon, iconColor }) => (
    // Estilo de tarjeta: Color oscuro (ej. navy/purple oscuro) y borde sutil
    <div className="flex items-center p-5 rounded-lg shadow-xl bg-gray-800 border border-gray-700">
        
        {/* Ícono envuelto con el color de acento y fondo más oscuro */}
        <div className={`p-3 rounded-full mr-4 flex items-center justify-center ${iconColor} bg-opacity-20`}>
            {icon}
        </div>
        
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            {/* El valor principal es blanco para mayor contraste */}
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

// Componente principal que agrupa las tarjetas
const DashboardSummary: React.FC<{ data: any }> = ({ data }) => {
    const cards = [
        {
            title: "Ingresos Totales (Hoy)",
            value: `$${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
            icon: <FaDollarSign size={24} />,
            iconColor: 'text-green-400 bg-green-900', // Verde para ingresos
        },
        {
            title: "Servicios Realizados",
            value: data.servicesCount.toString(),
            icon: <FaCut size={24} />,
            iconColor: 'text-yellow-400 bg-yellow-900', // Amarillo (tu color de acento)
        },
        {
            title: "Productos Vendidos",
            value: data.productsSoldCount.toString(),
            icon: <FaBox size={24} />,
            iconColor: 'text-blue-400 bg-blue-900', // Azul para productos
        },
        {
            title: "Clientes Atendidos",
            value: data.clientsAttended.toString(),
            icon: <FaUserFriends size={24} />,
            iconColor: 'text-purple-400 bg-purple-900', // Púrpura para clientes
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <SummaryCard key={index} {...card} />
            ))}
        </div>
    );
};

export default DashboardSummary;