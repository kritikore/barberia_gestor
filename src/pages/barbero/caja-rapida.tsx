import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useBarbero } from '@/hooks/useBarbero'; // 👈 Hook
import { FaMoneyBillWave, FaArrowLeft, FaPlus, FaTrash, FaShoppingCart } from 'react-icons/fa';

const CajaRapidaPage: NextPage = () => {
    const router = useRouter();
    const { barbero } = useBarbero();
    
    const [clientes, setClientes] = useState<any[]>([]);
    const [servicios, setServicios] = useState<any[]>([]);
    const [selectedCliente, setSelectedCliente] = useState('');
    const [selectedServicioId, setSelectedServicioId] = useState('');
    const [ticketItems, setTicketItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!barbero) return;
        fetch('/api/clientes').then(r => r.json()).then(data => {
            setClientes(data.filter((c: any) => c.id_bar === barbero.id_bar));
        });
        fetch('/api/servicios').then(r => r.json()).then(setServicios);
    }, [barbero]);

    const agregarAlTicket = () => {
        const serv = servicios.find(s => s.id_serv.toString() === selectedServicioId);
        if (serv) {
            setTicketItems([...ticketItems, serv]);
            setSelectedServicioId('');
        }
    };

    const handleCobrar = async () => {
        if(!selectedCliente || ticketItems.length === 0 || !barbero) return alert("Completa el ticket");
        setLoading(true);
        try {
            const fechaHoy = new Date().toISOString().split('T')[0];
            const horaActual = new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});

            const promesas = ticketItems.map(item => fetch('/api/citas', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id_clie: selectedCliente,
                    id_bar: barbero.id_bar, // 👈 ID REAL
                    id_serv: item.id_serv,
                    fecha: fechaHoy,
                    hora: horaActual,
                    observaciones: 'Venta Rápida',
                    estado: 'Completada'
                })
            }));

            await Promise.all(promesas);
            alert("✅ Cobro registrado");
            router.push('/barbero/dashboard');
        } catch (e) { alert("Error al cobrar"); } finally { setLoading(false); }
    };

    if (!barbero) return null;

    const total = ticketItems.reduce((acc, item) => acc + Number(item.precio), 0);

    return (
        <>
            <Head><title>Caja Rápida</title></Head>
            <main style={{maxWidth: '800px', margin: '0 auto'}}>
                <div style={{display:'flex', gap:15, marginBottom:20, alignItems:'center'}}>
                    <button onClick={()=>router.back()} style={{background:'none', border:'none', color:'#aaa', fontSize:'1.2rem'}}><FaArrowLeft/></button>
                    <h1><FaMoneyBillWave color="#D4AF37"/> Nueva Venta</h1>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                    <div style={{background: '#222', padding: 25, borderRadius: 12}}>
                        <h3>1. Datos</h3>
                        <label style={{color:'#ccc', display:'block', marginBottom:5}}>Cliente</label>
                        <select style={{width:'100%', padding:10, marginBottom:15}} value={selectedCliente} onChange={e => setSelectedCliente(e.target.value)}>
                            <option value="">-- Cliente --</option>
                            {clientes.map(c => <option key={c.id_clie} value={c.id_clie}>{c.nom_clie}</option>)}
                        </select>
                        <label style={{color:'#ccc', display:'block', marginBottom:5}}>Servicio</label>
                        <div style={{display:'flex', gap:10}}>
                            <select style={{flex:1, padding:10}} value={selectedServicioId} onChange={e => setSelectedServicioId(e.target.value)}>
                                <option value="">-- Servicio --</option>
                                {servicios.map(s => <option key={s.id_serv} value={s.id_serv}>{s.tipo} - ${s.precio}</option>)}
                            </select>
                            <button onClick={agregarAlTicket} style={{background:'var(--color-accent)', border:'none', width:40, cursor:'pointer'}}><FaPlus/></button>
                        </div>
                    </div>

                    <div style={{background: '#1a1a1a', padding: 25, borderRadius: 12, border: '2px dashed #444'}}>
                        <h3><FaShoppingCart/> Ticket</h3>
                        <ul>
                            {ticketItems.map((item, i) => (
                                <li key={i} style={{display:'flex', justifyContent:'space-between', color:'#ddd', borderBottom:'1px solid #333', padding:'5px 0'}}>
                                    <span>{item.tipo}</span>
                                    <span>${item.precio} <FaTrash color="red" style={{cursor:'pointer', marginLeft:5}} onClick={()=>setTicketItems(ticketItems.filter((_, idx)=>idx!==i))}/></span>
                                </li>
                            ))}
                        </ul>
                        <div style={{fontSize:'1.5rem', color:'#28a745', fontWeight:'bold', marginTop:20, textAlign:'right'}}>${total}</div>
                        <button onClick={handleCobrar} disabled={loading || ticketItems.length===0} style={{width:'100%', padding:15, background:'#28a745', color:'white', border:'none', marginTop:15, cursor:'pointer'}}>Cobrar</button>
                    </div>
                </div>
            </main>
        </>
    );
};
export default CajaRapidaPage;