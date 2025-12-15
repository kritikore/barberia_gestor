import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useBarbero } from '@/hooks/useBarbero';
import { FaShoppingBag, FaTrash, FaHome, FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';

export default function TiendaBarbero() {
    const router = useRouter();
    const { barbero } = useBarbero();
    
    const [productos, setProductos] = useState<any[]>([]);
    const [carrito, setCarrito] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [debugData, setDebugData] = useState<string>(''); // Para ver errores en pantalla
    
    // 1. Cargar Inventario GLOBAL
    const cargarInventario = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/insumos');
            const data = await res.json();
            
            console.log("📦 DATOS CRUDOS DE LA API:", data); // <--- MIRA ESTO EN F12

            if (Array.isArray(data)) {
                // Filtro "Inteligente": Busca stock en varias posibles columnas y convierte a número
                const disponibles = data.filter((p: any) => {
                    // Intentamos leer el stock de varias formas por si el nombre cambió
                    const stockReal = Number(p.stock_bodega || p.stock || p.cantidad || 0);
                    // Solo mostramos si hay stock positivo
                    return stockReal > 0;
                });
                
                if (disponibles.length === 0 && data.length > 0) {
                    setDebugData("Hay productos en BD pero todos tienen Stock 0 o el nombre de la columna stock_bodega está mal.");
                }

                setProductos(disponibles);
            } else {
                console.error("La API no devolvió una lista:", data);
                setProductos([]);
            }
        } catch (error: any) {
            console.error("Error cargando inventario:", error);
            setDebugData("Error de conexión: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarInventario(); }, []);

    const procesarVenta = async () => {
        if(carrito.length === 0) return;
        
        try {
            const promesas = carrito.map(item => fetch(`/api/insumos/${item.id_insumo}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    ...item,
                    // Aseguramos leer el stock correcto para restarlo
                    stock_bodega: Number(item.stock_bodega || item.stock || 0) - item.cantidad ,

                    id_bar: barbero.id_bar,       // Quién vende
                cantidad_venta: item.cantidad, // Cuántos vende
                precio_venta: item.costo || item.precio // A cómo lo vende
                })
            }));

            await Promise.all(promesas);
            alert("✅ Venta registrada correctamente");
            setCarrito([]);
            cargarInventario(); 

        } catch(e) { alert("Error al procesar venta"); }
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

    if (!barbero) return null;

    return (
        <>
            <main style={{maxWidth:'1000px', margin:'0 auto'}}>
                
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:30}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <FaShoppingBag size={28} color="#0D6EFD"/>
                        <h1 style={{margin:0, color:'white'}}>Tienda (Venta Productos)</h1>
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

                {/* MENSAJE DE DEPURACIÓN EN PANTALLA SI ALGO FALLA */}
                {debugData && (
                    <div style={{background:'rgba(255,193,7,0.2)', color:'#ffc107', padding:15, borderRadius:8, marginBottom:20, border:'1px solid #ffc107', display:'flex', alignItems:'center', gap:10}}>
                        <FaExclamationTriangle /> 
                        <span><b>DEBUG:</b> {debugData} (Revisa la consola F12 para ver los datos crudos)</span>
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
                                <small>Verifica que tengan stock mayor a 0 en el panel de Admin.</small>
                            </div>
                        ) : (
                            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:15}}>
                                {productos.map(p => {
                                    // Normalizamos valores para mostrar
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
                            Total: ${carrito.reduce((acc, item) => acc + ((item.costo||item.precio||0) * item.cantidad), 0)}
                        </div>

                        <button 
                            onClick={procesarVenta} 
                            disabled={carrito.length===0} 
                            style={{
                                width:'100%', marginTop:20, padding:12, 
                                background: carrito.length===0 ? '#555' : '#28a745', 
                                border:'none', color:'white', cursor: carrito.length===0 ? 'not-allowed' : 'pointer', 
                                borderRadius:8, fontWeight:'bold', fontSize:'1rem'
                            }}
                        >
                            Confirmar Venta
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}