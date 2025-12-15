import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { useBarbero } from '@/hooks/useBarbero'; // 👈 Hook
import { FaCalendarPlus, FaSave, FaArrowLeft } from 'react-icons/fa';

const AgendarBarberoPage: NextPage = () => {
    const router = useRouter();
    const { barbero } = useBarbero();
    
    const [clientes, setClientes] = useState<any[]>([]);
    const [servicios, setServicios] = useState<any[]>([]);
    const [formData, setFormData] = useState({ id_clie: '', id_serv: '', fecha: '', hora: '', observaciones: '' });

    useEffect(() => {
        if (!barbero) return;
        // Solo mis clientes
        fetch('/api/clientes').then(r => r.json()).then(data => {
            setClientes(data.filter((c: any) => c.id_bar === barbero.id_bar));
        });
        fetch('/api/servicios').then(r => r.json()).then(setServicios);
    }, [barbero]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!barbero) return;
        try {
            const res = await fetch('/api/citas', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    ...formData,
                    id_bar: barbero.id_bar, // 👈 ID REAL AUTO-ASIGNADO
                    estado: 'Confirmada'
                })
            });
            if(res.ok) { alert("✅ Cita agendada"); router.push('/barbero/citas'); }
        } catch(e) { console.error(e); }
    };

    if (!barbero) return null;

    return (
        <>
            <Head><title>Agendar Cita</title></Head>
            <main style={{maxWidth: '600px', margin: '0 auto'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:30}}>
                    <button onClick={()=>router.back()} style={{background:'none', border:'none', color:'#aaa', fontSize:'1.2rem'}}><FaArrowLeft/></button>
                    <h1><FaCalendarPlus color="var(--color-accent)"/> Agendar Cita</h1>
                </div>
                
                <form onSubmit={handleSubmit} style={{background: '#222', padding: 30, borderRadius: 12, display:'flex', flexDirection:'column', gap: 20}}>
                    <div>
                        <label style={{color:'#ccc'}}>Cliente (De mi cartera)</label>
                        <select style={{width:'100%', padding:12, marginTop:5}} required value={formData.id_clie} onChange={e => setFormData({...formData, id_clie: e.target.value})}>
                            <option value="">-- Seleccionar --</option>
                            {clientes.map(c => <option key={c.id_clie} value={c.id_clie}>{c.nom_clie} {c.apell_clie}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{color:'#ccc'}}>Servicio</label>
                        <select style={{width:'100%', padding:12, marginTop:5}} required value={formData.id_serv} onChange={e => setFormData({...formData, id_serv: e.target.value})}>
                            <option value="">-- Seleccionar --</option>
                            {servicios.map(s => <option key={s.id_serv} value={s.id_serv}>{s.tipo} - ${s.precio}</option>)}
                        </select>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
                        <input type="date" required style={{padding:12}} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                        <input type="time" required style={{padding:12}} onChange={e => setFormData({...formData, hora: e.target.value})} />
                    </div>
                    <button type="submit" style={{background: 'var(--color-accent)', padding: 15, border:'none', fontWeight:'bold', cursor:'pointer'}}><FaSave /> Guardar</button>
                </form>
            </main>
        </>
    );
};
export default AgendarBarberoPage;