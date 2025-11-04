// src/pages/inventario/index.tsx (CORREGIDO FINAL)

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';

// 🔑 CORRECCIÓN 1: Eliminamos la importación de Sidebar y GlobalLayout
// import Sidebar from '@/components/Sidebar';
// import layoutStyles from '@/styles/GlobalLayout.module.css';

// Importamos los componentes que SÍ van en esta página
import MetricCard from '@/components/MetricCard'; 
import ProductoCard from '@/components/ProductoCard'; // (Asegúrate de que el nombre del archivo coincida)
import AddProductModal from '@/components/AddProductoModal'; // (Asegúrate de que el nombre del archivo coincida)
import EditProductModal from '@/components/EditProductModal';
import AddStockModal from '@/components/AddStockModal';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Asegúrate de que tu conexión a la DB esté en src/lib/db.ts

import cardStyles from '@/styles/Inventario.module.css';
import { FaBox, FaExclamationTriangle, FaTimesCircle, FaDollarSign } from 'react-icons/fa';

// 🔑 CORRECCIÓN 2: Definición de tipo basada en ProductoCard y la DB
interface Producto {
    id_prod: number;
    nombre: string;
    marca: string;
    precio: number;
    stock: number;
    etiquetas: string[];
    descripcion: string;
    // Añade cualquier otra propiedad que ProductoCard espere
}

interface Metrics {
    totalProductos: number;
    stockBajo: number;
    sinStock: number;
    valorTotal: number;
}

const InventarioPage: NextPage = () => {
    const moduleName = "Inventario"; 
    
    // Estados para los 3 Modales
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [metrics, setMetrics] = useState<Metrics>({
        totalProductos: 0,
        stockBajo: 0,
        sinStock: 0,
        valorTotal: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const metricsRes = await fetch('/api/inventario/metrics');
            const metricsData = await metricsRes.json();
            setMetrics(metricsData);

            const productsRes = await fetch('/api/inventario');
            const productsData = await productsRes.json();
            
            // 🔑 CORRECCIÓN 2: Asegurarse de que el mapeo coincida con la interfaz Producto
            const productosMapeados: Producto[] = productsData.map((p: any) => ({
                id_prod: p.id_prod,
                nombre: p.nom_prod,
                marca: p.marc_prod,
                precio: parseFloat(p.precio_prod),
                stock: p.stock,
                etiquetas: [p.marc_prod], 
                descripcion: `Un producto de ${p.marc_prod}.` 
            }));
            setProductos(productosMapeados);

        } catch (error) {
            console.error("Error cargando datos de inventario:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Funciones de Acción (Ahora conectadas)
    const handleAddProduct = () => setIsAddModalOpen(true);
    
    const handleEditProduct = (producto: Producto) => {
        setSelectedProduct(producto);
        setIsEditModalOpen(true);
    };
    
    const handleDeleteProduct = async (id: number) => {
        if (confirm(`¿Estás seguro de eliminar este producto? Esta acción es irreversible.`)) {
            try {
                const response = await fetch(`/api/inventario/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const res = await response.json();
                    throw new Error(res.message);
                }
                fetchData(); 
            } catch (error: any) {
                alert(`Error al eliminar: ${error.message}`);
            }
        }
    };
    
    const handleAddStock = (producto: Producto) => {
        setSelectedProduct(producto);
        setIsStockModalOpen(true);
    };

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            {isAddModalOpen && (
                <AddProductModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onProductAdded={fetchData} 
                />
            )}
            {isStockModalOpen && selectedProduct && (
                <AddStockModal
                    producto={selectedProduct}
                    onClose={() => setIsStockModalOpen(false)}
                    onStockUpdated={fetchData}
                />
            )}
            {isEditModalOpen && selectedProduct && (
                <EditProductModal
                    producto={selectedProduct}
                    onClose={() => setIsEditModalOpen(false)}
                    onProductUpdated={fetchData}
                />
            )}
            
            {/* El Layout de _app.tsx aplica el <main> y el padding */}
            
            <div className={cardStyles.headerInventario}>
                <h1>📦 Gestión de Inventario y Productos</h1>
                <button className={cardStyles.agregarButton} onClick={handleAddProduct}>
                   + Añadir Nuevo Producto
                </button>
            </div>

            <p style={{ color: '#aaa', marginBottom: '30px' }}>
                Administra el stock y productos de la barbería.
            </p>

            {/* === 1. GRID DE MÉTRICAS (Datos Reales) === */}
            <div className={cardStyles.metricGrid}>
                <MetricCard 
                    titulo="Total Productos" 
                    valor={metrics.totalProductos} 
                    icono={<FaBox />} 
                    claseColor="productos" 
                />
                <MetricCard 
                    titulo="Stock Bajo (<10)" 
                    valor={metrics.stockBajo} 
                    icono={<FaExclamationTriangle />} 
                    claseColor="bajo" 
                />
                <MetricCard 
                    titulo="Sin Stock" 
                    valor={metrics.sinStock} 
                    icono={<FaTimesCircle />} 
                    claseColor="sin_stock" 
                />
                <MetricCard 
                    titulo="Valor Total" 
                    valor={`$${metrics.valorTotal.toFixed(2)}`} 
                    icono={<FaDollarSign />} 
                    claseColor="valor" 
                />
            </div>

            {/* === 2. BARRA DE FILTROS (Funcionalidad pendiente) === */}
            <div className={cardStyles.filterBar}>
                <input type="text" placeholder="🔍 Buscar productos..." />
                <select><option>Todas las categorías</option></select>
                <select><option>Todo el stock</option></select>
                <button className={`${cardStyles.filterButton} ${cardStyles.clearButton}`}>
                   Limpiar
                </button>
            </div>

            {/* === 3. LISTA DE PRODUCTOS (Datos Reales) === */}
            <div className={cardStyles.grid}>
                {loading ? (
                    <p>Cargando productos...</p>
                ) : (
                    productos.map((producto) => (
                        <ProductoCard 
                            key={producto.id_prod} 
                            producto={producto}
                            onEdit={() => handleEditProduct(producto)}
                            onDelete={() => handleDeleteProduct(producto.id_prod)}
                            onAddStock={() => handleAddStock(producto)}
                        />
                    ))
                )}
            </div>
        </>
    );
};

export default InventarioPage;