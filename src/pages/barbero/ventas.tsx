import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useBarbero } from '@/hooks/useBarbero';
import { FaShoppingBag, FaTrash, FaHome, FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';
import CheckoutModal from '@/components/CheckoutModal';
import TicketModal from '@/components/TicketModal';

export default function TiendaBarbero() {
    const router = useRouter();
    const { barbero } = useBarbero();
    
    const [productos, setProductos] = useState<any[]>([]);
    const [carrito, setCarrito] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [debugData, setDebugData] = useState<string>('');

    // Estados para Modales de Cobro
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [ticketData, setTicketData] = useState<any>(null);
    
    // 1. Cargar Inventario
    const cargarInventario = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/insumos');
            const data = await res.json();
            
            if (Array.isArray(data)) {
                const disponibles = data.filter((p: any) => {
                    const stockReal = Number(p.stock_bodega || p.stock || p.cantidad || 0);
                    return stockReal > 0;
                });
                setProductos(disponibles);
            } else {
                setProductos([]);
            }
        } catch (error: any) {
            console.error("Error cargando inventario:", error);
            setDebugData("Error de conexión: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if(barbero) cargarInventario(); }, [barbero]);

    // 2. Calcular Total del Carrito
    const totalCarrito = carrito.reduce((acc, item) => acc + ((item.costo||item.precio||0) * item.cantidad), 0);

    // 3. Abrir Modal de Cobro
    const handleInitiateCheckout = () => {
        if(carrito.length === 0) return;
        setIsCheckoutOpen(true);
    };

    // 4. Procesar Venta Real
    const handleConfirmarVenta = async (metodoPago: string) => {
        // 🔒 CORRECCIÓN AQUÍ: Si no hay barbero cargado, detenemos la función.
        // Esto le asegura a TypeScript que 'barbero' no es null de aquí en adelante.
        if (!barbero) return; 

        try {
            const promesas = carrito.map(item => fetch(`/api/insumos/${item.id_insumo}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    ...item,
                    stock_bodega: Number(item.stock_bodega || item.stock || 0) - item.cantidad ,
                    id_bar: barbero.id_bar, // Ahora TS sabe que esto es seguro
                    cantidad_venta: item.cantidad,
                    precio_venta: item.costo || item.precio,
                    metodo_pago: metodoPago
                })
            }));

            await Promise.all(promesas);

            const fechaHoy = new Date().toLocaleDateString();
            const horaHoy = new Date().toLocaleTimeString();
            
            setTicketData({
                cliente: "Venta de Mostrador",
                servicio: carrito.map(c => `${c.nom_insumo} (x${c.cantidad})`).join(', '),
                precio: totalCarrito,
                // TS ya sabe que barbero existe gracias al 'if' del inicio
                barbero: `${barbero.nom_bar} ${barbero.apell_bar || ''}`,
                fecha: fechaHoy,
                hora: horaHoy,
                folio: `V-${Math.floor(Math.random() * 10000)}`,
                metodoPago: metodoPago
            });

            setCarrito([]); 
            setIsCheckoutOpen(false); 
            cargarInventario(); 

        } catch(e) { 
            alert("Error al procesar venta"); 
            setIsCheckoutOpen(false);
        }
    };

    const agregar = (p: any) => {
        const enCarro = carrito.find(c => c.id_insumo === p.id_insumo);
        const cantidadActual = enCarro ? enCarro.cantidad : 0;
        const stockDisponible = Number(p.stock_bodega || p.stock || 0);
        
        if (cantidadActual + 1 > stockDisponible) return alert("No hay suficiente stock en bodega");

        if(enCarro) {
            setCarrito(carrito.map(c => c.id_insumo===p.id_insumo ? {...c, cantidad: c.cantidad+1} : c));
        } else {
            setCarrito([...carrito, {...p, cantidad:1}]);
        }
    };

    // Si barbero es null, no renderizamos nada (esto protege el render visual)
    if (!barbero) return null;

    return (
        <>
            <Head><title>Tienda | Punto de Venta</title></Head>

            {isCheckoutOpen && (
                <CheckoutModal 
                    cita={{ 
                        nombre_servicio: `Venta de ${carrito.length} productos`, 
                        precio: totalCarrito 
                    }}
                    onClose={() => setIsCheckoutOpen(false)}
                    onConfirm={handleConfirmarVenta}
                />
            )}

            {ticketData && (
                <TicketModal 
                    data={ticketData} 
                    onClose={() => setTicketData(null)} 
                />
            )}

            <main style={{maxWidth:'1000px', margin:'0 auto', padding: '20px'}}>
                
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:30}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <FaShoppingBag size={28} color="#0D6EFD"/>
                        <h1 style={{margin:0, color:'white'}}>Tienda</h1>
                    </div>
                    <button 
                        onClick={() => router.push('/barbero/dashboard')} 
                        style={{
                            background: '#333', color: 'white', border: '1px solid #555', 
                            padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', 
                            display: 'flex', alignItems: 'center', gap: 8, fontWeight:'bold'
                        }}
                    >
                        <FaHome /> Volver al Dashboard
                    </button>
                </div>

                {debugData && (
                    <div style={{background:'rgba(255,193,7,0.2)', color:'#ffc107', padding:15, borderRadius:8, marginBottom:20, border:'1px solid #ffc107', display:'flex', alignItems:'center', gap:10}}>
                        <FaExclamationTriangle /> 
                        <span><b>DEBUG:</b> {debugData}</span>
                    </div>
                )}
                
                <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:30}}>
                    
                    {/* LISTA DE PRODUCTOS */}
                    <div>
                        {loading ? (
                            <p style={{color:'white'}}>Cargando inventario...</p>
                        ) : productos.length === 0 ? (
                            <div style={{textAlign:'center', padding:40, background:'#222', borderRadius:10, color:'#aaa'}}>
                                <FaBoxOpen size={40} style={{marginBottom:10}}/>
                                <p>No hay productos disponibles para venta.</p>
                            </div>
                        ) : (
                            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:15}}>
                                {productos.map(p => {
                                    const stockDisplay = p.stock_bodega || p.stock || 0;
                                    const precioDisplay = p.costo || p.precio || 0;

                                    return (
                                        <div key={p.id_insumo} style={{background:'#222', padding:15, borderRadius:10, textAlign:'center', border:'1px solid #333'}}>
                                            <h4 style={{color:'white', margin:'10px 0', minHeight:'40px'}}>{p.nom_insumo}</h4>
                                            <div style={{color:'var(--color-accent)', fontWeight:'bold', fontSize:'1.1rem'}}>${precioDisplay}</div>
                                            <div style={{color:'#888', fontSize:'0.8rem', margin:'5px 0'}}>Stock: {stockDisplay}</div>
                                            <button 
                                                onClick={()=>agregar(p)} 
                                                style={{marginTop:10, width:'100%', background:'#0D6EFD', border:'none', color:'white', padding:'8px', cursor:'pointer', borderRadius:6, fontWeight:'bold'}}
                                            >
                                                + Agregar
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* CARRITO */}
                    <div style={{background:'#1a1a1a', padding:20, borderRadius:12, height:'fit-content', border:'1px solid #444', position:'sticky', top:20}}>
                        <h3 style={{color:'white', marginTop:0, borderBottom:'1px solid #333', paddingBottom:10}}>Carrito de Venta</h3>
                        
                        {carrito.length === 0 ? (
                            <p style={{color:'#666', fontStyle:'italic'}}>Carrito vacío</p>
                        ) : (
                            carrito.map((c, i) => {
                                const precio = c.costo || c.precio || 0;
                                return (
                                    <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', color:'#ccc', borderBottom:'1px solid #333', padding:'10px 0'}}>
                                        <div>
                                            <div style={{color:'white', fontWeight:'bold'}}>{c.nom_insumo}</div>
                                            <small>Cant: {c.cantidad} x ${precio}</small>
                                        </div>
                                        <FaTrash color="#dc3545" style={{cursor:'pointer'}} onClick={()=>setCarrito(carrito.filter((_,idx)=>idx!==i))}/>
                                    </div>
                                );
                            })
                        )}

                        <div style={{marginTop:20, fontSize:'1.2rem', color:'white', textAlign:'right', fontWeight:'bold'}}>
                            Total: ${totalCarrito}
                        </div>

                        <button 
                            onClick={handleInitiateCheckout} 
                            disabled={carrito.length===0} 
                            style={{
                                width:'100%', marginTop:20, padding:12, 
                                background: carrito.length===0 ? '#555' : '#28a745', 
                                border:'none', color:'white', cursor: carrito.length===0 ? 'not-allowed' : 'pointer', 
                                borderRadius:8, fontWeight:'bold', fontSize:'1rem'
                            }}
                        >
                            Cobrar
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}