// src/components/SalesChart.tsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyRevenue {
    fecha: string;
    total: number;
}

const SalesChart: React.FC = () => {
    const [data, setData] = useState<DailyRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    // Estado para evitar errores de hidratación en Next.js
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const fetchChartData = async () => {
            try {
                const res = await fetch('/api/dashboard/chart-data');
                if (res.ok) {
                    const chartData = await res.json();
                    setData(chartData);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchChartData();
    }, []);

    if (!isClient) return null;

    if (loading) return <div className="h-64 flex items-center justify-center text-gray-400">Cargando gráfico...</div>;

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
                <p>📉 Sin actividad reciente</p>
                <p className="text-sm">No hay ventas en los últimos 7 días.</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                    <XAxis dataKey="fecha" stroke="#aaa" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#aaa" fontSize={12} tickFormatter={(val) => `$${val}`} tickLine={false} axisLine={false} />
                    <Tooltip 
                        cursor={{fill: '#333', opacity: 0.4}}
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']}
                    />
                    <Bar dataKey="total" fill="#0D6EFD" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesChart;