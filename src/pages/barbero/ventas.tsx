// src/pages/barbero/ventas.tsx

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaShoppingCart, FaArrowLeft, FaTrash, FaCheckCircle, FaSearch } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout';
import SaleProductCard from '@/components/SaleProductCard'; 

interface Producto {
    id_prod: number;
    nombre: string;
    marca: string;
    precio: number;
    stock: number;
}

interface CartItem extends Producto {
    cantidadCarrito: number;
}

const VentasPage: NextPage = () => {
    const router = useRouter();
    
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // Estado para notificación flotante
    const [notification, setNotification] = useState<{show: boolean, message: string}>({ show: false, message: '' });

    // Cargar inventario
    const fetchProductos = async () => {
        try {
            const response = await fetch('/api/inventario'); 
            if (response.ok) {
                const data = await response.json();
                const mapeados = data.map((p: any) => ({
                    id_prod: p.id_prod,
                    nombre: p.nom_prod,
                    marca: p.marc_prod,
                    precio: parseFloat(p.precio_prod),
                    stock: p.stock
                }));
                setProductos(mapeados);
                setFilteredProductos(mapeados);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    // Filtro de búsqueda
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = productos.filter(p => 
            p.nombre.toLowerCase().includes(term) || 
            p.marca.toLowerCase().includes(term)
        );
        setFilteredProductos(filtered);
    }, [searchTerm, productos]);

    // Agregar al carrito
    const addToCart = (producto: Producto) => {
        setCart(prev => {
            const exists = prev.find(item => item.id_prod === producto.id_prod);
            if (exists) {
                if (exists.cantidadCarrito < producto.stock) {
                    return prev.map(item => 
                        item.id_prod === producto.id_prod 
                            ? { ...item, cantidadCarrito: item.cantidadCarrito + 1 } 
                            : item
                    );
                } else {
                    alert("No hay suficiente stock disponible.");
                    return prev;
                }
            }
            return [...prev, { ...producto, cantidadCarrito: 1 }];
        });
    };

    // Remover del carrito
    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id_prod !== id));
    };

    const totalVenta = cart.reduce((sum, item) => sum + (item.precio * item.cantidadCarrito), 0);

    // Procesar Venta
    const handleCobrar = async () => {
        if (cart.length === 0) return;
        setProcessing(true);

        try {
            const response = await fetch('/api/barbero/registrar-venta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carrito: cart.map(item => ({
                        id_prod: item.id_prod,
                        cantidad: item.cantidadCarrito,
                        precio: item.precio
                    })),
                    total: totalVenta,
                    id_bar: 1 
                }),
            });

            if (!response.ok) throw new Error('Error al procesar venta');

            // Mostrar notificación de éxito
            setNotification({ show: true, message: `Venta de $${totalVenta.toFixed(2)} registrada con éxito.` });
            setTimeout(() => setNotification({ show: false, message: '' }), 3000);

            setCart([]); 
            fetchProductos(); 

        } catch (error) {
            alert('Error al registrar la venta.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <BarberLayout>
            <Head><title>Registrar Venta - Barbero</title></Head>

            {/* Notificación Flotante */}
            {notification.show && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '15px 25px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FaCheckCircle size={24} />
                    <div>
                        <h4 style={{margin: 0, fontWeight: 'bold'}}>¡Éxito!</h4>
                        <p style={{margin: 0, fontSize: '0.9em'}}>{notification.message}</p>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <button onClick={() => router.push('/barbero/dashboard')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.5em' }}>
                    <FaArrowLeft />
                </button>
                <h1 style={{ margin: 0, color: 'white' }}>Punto de Venta</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* COLUMNA 1: CATÁLOGO */}
                <div>
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2A2A2A', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #444' }}>
                        <FaSearch style={{color: '#888'}} />
                        <input 
                            type="text" 
                            placeholder="Buscar productos..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1em' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {loading ? <p style={{color: '#aaa'}}>Cargando inventario...</p> : 
                            filteredProductos.map(p => (
                                <SaleProductCard key={p.id_prod} producto={p} onAddToCart={addToCart} />
                            ))
                        }
                    </div>
                </div>

                {/* COLUMNA 2: CARRITO */}
                <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid var(--color-accent)', position: 'sticky', top: '20px' }}>
                    <h2 style={{ color: 'var(--color-accent)', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaShoppingCart /> Carrito
                    </h2>

                    {cart.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                            Carrito vacío. Agrega productos.
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
                            {cart.map(item => (
                                <li key={item.id_prod} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #333' }}>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 'bold' }}>{item.nombre}</div>
                                        <div style={{ color: '#aaa', fontSize: '0.9em' }}>${item.precio} x {item.cantidadCarrito}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>${(item.precio * item.cantidadCarrito).toFixed(2)}</span>
                                        <button onClick={() => removeFromCart(item.id_prod)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2em', fontWeight: 'bold', color: 'white' }}>
                            <span>Total:</span>
                            <span style={{ color: '#4caf50' }}>${totalVenta.toFixed(2)}</span>
                        </div>
                        
                        <button 
                            onClick={handleCobrar}
                            disabled={cart.length === 0 || processing}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: 'var(--color-accent)',
                                color: '#1C1C1C',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '1.1em',
                                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                                opacity: cart.length === 0 ? 0.5 : 1
                            }}
                        >
                            {processing ? 'Procesando...' : 'Cobrar Venta'}
                        </button>
                    </div>
                </div>
            </div>
        </BarberLayout>
    );
};

export default VentasPage;