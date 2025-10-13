// src/pages/inventario/index.tsx

import React from 'react'; 
import { NextPage } from 'next';
import Head from 'next/head';

// Importaciones de iconos de React Icons
import { FaBox, FaExclamationTriangle, FaTimesCircle, FaDollarSign } from 'react-icons/fa';

// Importaciones de componentes y estilos
import Sidebar from '@/components/Sidebar';
import MetricCard from '@/components/MetricCard'; 
import ProductoCard from '@/components/ProductCard';
import layoutStyles from '@/styles/GlobalLayout.module.css';
import cardStyles from '@/styles/Inventario.module.css'; 

// 🔑 DEFINICIÓN DEL TIPO DE PRODUCTO (Resuelve el error 'any' implícito)
interface Producto {
    id: number;
    nombre: string;
    marca: string;
    stock: number;
    precio: number;
    etiquetas: string[];
    descripcion: string;
}

// 🔑 DATOS SIMULADOS (CONSTANTES FUERA DEL COMPONENTE)
// Definidas aquí para que no se re-creen en cada renderizado.
const MetricsSimuladas = [
    { titulo: "Total Productos", valor: 7, icono: <FaBox />, claseColor: 'productos' as const },
    { titulo: "Stock Bajo", valor: 2, icono: <FaExclamationTriangle />, claseColor: 'bajo' as const }, 
    { titulo: "Sin Stock", valor: 1, icono: <FaTimesCircle />, claseColor: 'sin_stock' as const }, 
    { titulo: "Valor Total", valor: "$4,409.1", icono: <FaDollarSign />, claseColor: 'valor' as const },
];

const ProductosSimulados: Producto[] = [ // Asignamos el tipo Producto[]
    {
      id: 1,
      nombre: "Shampoo Profesional",
      marca: "L'Oreal Professional",
      stock: 7,
      precio: 45.99,
      etiquetas: ["Cuidado Capilar"],
      descripcion: "Shampoo profesional para todo tipo de cabello con fórmula nutritiva."
    },
    {
      id: 2,
      nombre: "Tijeras de Corte",
      marca: "Jaguar",
      stock: 2, 
      precio: 120.00,
      etiquetas: ["Herramientas", "Corte"],
      descripcion: "Tijeras profesionales de acero japonés para cortes de precisión."
    },
    {
      id: 3,
      nombre: "Capa de Corte",
      marca: "BarberSupply",
      stock: 0, 
      precio: 15.50,
      etiquetas: ["Accesorios"],
      descripcion: "Capa de corte impermeable con cierre ajustable."
    },
];
// FIN DE DATOS SIMULADOS

const InventarioPage: NextPage = () => {
    const moduleName = "Inventario"; 
    
    // 🔑 ESTADOS DE FILTROS (Deben estar dentro del componente)
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('Todas las categorías');
    const [stockFilter, setStockFilter] = React.useState('Todo el stock'); 

    // 🔑 FUNCIONES PLACEHOLDER (Deben estar dentro del componente)
    const handleAddProduct = () => alert("Acción: Abrir modal para añadir nuevo producto.");
    const handleEditProduct = (id: number) => alert(`Acción: Editar producto con ID: ${id}`);
    const handleDeleteProduct = (id: number) => {
        if (confirm(`¿Estás seguro de eliminar el producto con ID: ${id}?`)) {
            alert("Acción: Eliminar producto (llamar API).");
        }
    };
    const handleAddStock = (id: number) => alert(`Acción: Abrir modal para añadir stock al ID: ${id}`);
    
    const handleClearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('Todas las categorías');
        setStockFilter('Todo el stock');
    };

    // 🔑 Lógica de Filtrado (Se puede expandir aquí)
    const filteredProducts = ProductosSimulados.filter(producto => {
        const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              producto.marca.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesCategory = true;
        if (categoryFilter !== 'Todas las categorías') {
            matchesCategory = producto.etiquetas.includes(categoryFilter);
        }

        let matchesStock = true;
        if (stockFilter === 'Stock Bajo') {
            matchesStock = producto.stock > 0 && producto.stock <= 2;
        } else if (stockFilter === 'Sin Stock') {
            matchesStock = producto.stock === 0;
        } else if (stockFilter === 'En Stock') {
            matchesStock = producto.stock > 2;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    return (
        <>
            <Head>
                <title>{moduleName} - Barbería Gestor</title>
            </Head>
            
            <div className={layoutStyles.layoutContainer}> 
                <Sidebar currentModule={moduleName} />
                
                <main className={layoutStyles.mainContent}> 
                    <div className={cardStyles.headerInventario}>
                        <h1>📦 Gestión de Inventario y Productos</h1>
                        <button className={cardStyles.agregarButton} onClick={handleAddProduct}>
                           + Añadir Nuevo Producto
                        </button>
                    </div>

                    <p style={{ color: '#999', marginBottom: '30px' }}>
                        Administra el stock y productos de la barbería.
                    </p>

                    {/* === 1. GRID DE MÉTRICAS === */}
                    <div className={cardStyles.metricGrid}>
                        {MetricsSimuladas.map((metric) => (
                            <MetricCard key={metric.titulo} {...metric} />
                        ))}
                    </div>

                    {/* === 2. BARRA DE FILTROS === */}
                    <div className={cardStyles.filterBar}>
                        <input 
                            type="text" 
                            placeholder="🔍 Buscar productos por nombre o marca." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="Todas las categorías">Todas las categorías</option>
                            <option value="Cuidado Capilar">Cuidado Capilar</option>
                            <option value="Herramientas">Herramientas</option>
                            <option value="Accesorios">Accesorios</option>
                        </select>
                        
                        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                            <option value="Todo el stock">Todo el stock</option>
                            <option value="En Stock">En Stock</option>
                            <option value="Stock Bajo">Stock Bajo</option>
                            <option value="Sin Stock">Sin Stock</option>
                        </select>

                        <button 
                            className={`${cardStyles.filterButton} ${cardStyles.clearButton}`}
                            onClick={handleClearFilters}
                        >
                           Limpiar
                        </button>
                    </div>

                    {/* === 3. LISTA DE PRODUCTOS (GRID) === */}
                    <div className={cardStyles.grid}>
                        {filteredProducts.map((producto) => ( // 🔑 Usamos filteredProducts
                            <ProductoCard 
                                key={producto.id} 
                                producto={producto}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                                onAddStock={handleAddStock}
                            />
                        ))}
                    </div>

                </main>
            </div>
        </>
    );
};

export default InventarioPage;