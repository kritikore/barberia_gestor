// src/pages/barbero/nuevo-servicio.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaCut, FaArrowLeft, FaMoneyBillWave, FaUser, FaPlus, FaTrash } from 'react-icons/fa';
import BarberLayout from '@/components/BarberLayout';
import styles from '@/styles/Modal.module.css'; 

interface Cliente { id_clie: number; nom_clie: string; apell_clie: string; }
interface ServicioDB { id_serv: number; tipo: string; precio: string; }

// Interfaz para los items en el "carrito"
interface ServicioTicket {
    id_serv: number;
    nombre: string;
    precio: number;
}

const categoriasServicios = [
    "Corte de cabello", "Arreglo de barba y bigote", "Afeitado clásico",
    "Tratamientos capilares", "Tratamientos faciales", "Tintes",
    "Ondulación", "Manicura y pedicura", "Depilación", "Masajes", "Diseños"
];

const NuevoServicioPage: NextPage = () => {
    const router = useRouter();
    const { clienteId } = router.query;

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [serviciosDB, setServiciosDB] = useState<ServicioDB[]>([]);
    
    // Formulario General
    const [selectedClient, setSelectedClient] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]); // Fecha hoy por defecto

    // Selección actual (para agregar)
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [precioActual, setPrecioActual] = useState(0);

    // 🔑 TICKET: Lista de servicios seleccionados
    const [ticket, setTicket] = useState<ServicioTicket[]>([]);
    const [loading, setLoading] = useState(false);

    // Cargar datos
    useEffect(() => {
        const loadData = async () => {
            try {
                const [resCli, resServ] = await Promise.all([
                    fetch('/api/clientes'),
                    fetch('/api/servicios')
                ]);
                if (resCli.ok) setClientes(await resCli.json());
                if (resServ.ok) setServiciosDB(await resServ.json());
                if (clienteId) setSelectedClient(clienteId as string);
            } catch (error) { console.error(error); }
        };
        loadData();
    }, [clienteId]);

    // 🔑 Lógica de Filtrado INTELIGENTE (Palabras clave)
    const serviciosFiltrados = serviciosDB.filter(s => {
        if (!selectedCategory || selectedCategory === "") return true;
        
        const nombreServicio = s.tipo.toLowerCase();
        const palabrasCategoria = selectedCategory.toLowerCase().split(' ').filter(w => w.length > 3); // Filtra palabras cortas como 'de', 'y'

        // Si alguna palabra clave de la categoría está en el nombre del servicio, lo mostramos
        // Ej: Categoría "Corte de cabello" (Claves: corte, cabello) -> Coincide con "Corte Clásico"
        return palabrasCategoria.some(palabra => nombreServicio.includes(palabra)) || nombreServicio.includes(selectedCategory.toLowerCase());
    });

    // Al seleccionar un servicio del dropdown
    const handleServiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedServiceId(id);
        const servicio = serviciosDB.find(s => s.id_serv.toString() === id);
        if (servicio) setPrecioActual(parseFloat(servicio.precio));
    };

    // 🔑 AGREGAR AL TICKET
    const handleAddToTicket = () => {
        if (!selectedServiceId) return;
        const servicio = serviciosDB.find(s => s.id_serv.toString() === selectedServiceId);
        if (servicio) {
            const newItem: ServicioTicket = {
                id_serv: servicio.id_serv,
                nombre: servicio.tipo,
                precio: precioActual // Usamos el precio que el barbero haya podido editar
            };
            setTicket([...ticket, newItem]);
            // Resetear selección
            setSelectedServiceId('');
            setPrecioActual(0);
        }
    };

    // 🔑 ELIMINAR DEL TICKET
    const handleRemoveFromTicket = (index: number) => {
        const newTicket = [...ticket];
        newTicket.splice(index, 1);
        setTicket(newTicket);
    };

    // Calcular Total
    const totalTicket = ticket.reduce((sum, item) => sum + item.precio, 0);

    // GUARDAR TODO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (ticket.length === 0) return alert("Debes agregar al menos un servicio al ticket.");
        
        setLoading(true);
        try {
            const response = await fetch('/api/barbero/registrar-servicio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_clie: selectedClient,
                    servicios: ticket, // Enviamos el array
                    fecha: fecha // Enviamos la fecha seleccionada
                }),
            });

            if (!response.ok) throw new Error('Error al registrar');

            alert(`✅ Cobro registrado exitosamente.\nTotal: $${totalTicket.toFixed(2)}`);
            
            if (clienteId) router.push(`/barbero/clientes/${clienteId}`);
            else router.push('/barbero/dashboard');

        } catch (error) {
            alert('Error al registrar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BarberLayout>
            <Head><title>Nuevo Servicio - Ticket</title></Head>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px'}}>
                    <FaArrowLeft /> Volver
                </button>

                <div className={styles.modalContent} style={{ maxWidth: '100%' }}>
                    <div className={styles.modalHeader}>
                        <h2 style={{ color: 'var(--color-accent)' }}>
                            <FaCut style={{marginRight: 10}}/> Crear Ticket de Servicio
                        </h2>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        
                        {/* 1. SELECCIÓN DE CLIENTE Y FECHA */}
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label><FaUser /> Cliente</label>
                                <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} required className={styles.input} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}>
                                    <option value="">Selecciona cliente...</option>
                                    {clientes.map(c => <option key={c.id_clie} value={c.id_clie}>{c.nom_clie} {c.apell_clie}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Fecha del Servicio</label>
                                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}/>
                            </div>
                        </div>

                        <hr style={{ borderColor: '#444', margin: '20px 0' }} />

                        {/* 2. AGREGAR SERVICIOS AL TICKET */}
                        <div style={{ backgroundColor: '#252525', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <h3 style={{marginTop: 0, color: '#ccc', fontSize: '1em'}}>Agregar Servicio al Ticket</h3>
                            
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Categoría</label>
                                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}>
                                        <option value="">-- Todas --</option>
                                        {categoriasServicios.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Servicio</label>
                                    <select value={selectedServiceId} onChange={handleServiceSelect} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: 'white', border: '1px solid #444', width: '100%' }}>
                                        <option value="">Selecciona...</option>
                                        {serviciosFiltrados.map(s => (
                                            <option key={s.id_serv} value={s.id_serv}>{s.tipo} (${parseFloat(s.precio).toFixed(2)})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                                <div className={styles.formGroup} style={{ flexGrow: 1 }}>
                                    <label>Precio ($)</label>
                                    <input type="number" value={precioActual} onChange={(e) => setPrecioActual(parseFloat(e.target.value))} style={{ padding: '10px', borderRadius: '6px', background: '#1a1a1a', color: '#4caf50', border: '1px solid #444', width: '100%', fontWeight: 'bold' }} />
                                </div>
                                <button type="button" onClick={handleAddToTicket} style={{ padding: '10px 20px', backgroundColor: '#0D6EFD', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '42px', marginBottom: '12px' }}>
                                    <FaPlus /> Agregar
                                </button>
                            </div>
                        </div>

                        {/* 3. RESUMEN DEL TICKET (LISTA) */}
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{color: 'var(--color-accent)'}}>Resumen del Ticket</h3>
                            {ticket.length === 0 ? (
                                <p style={{color: '#666', fontStyle: 'italic'}}>No hay servicios agregados aún.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #444', borderRadius: '6px', overflow: 'hidden' }}>
                                    {ticket.map((item, index) => (
                                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', borderBottom: '1px solid #444', backgroundColor: '#2a2a2a', alignItems: 'center' }}>
                                            <span>{item.nombre}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>${item.precio.toFixed(2)}</span>
                                                <button type="button" onClick={() => handleRemoveFromTicket(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><FaTrash /></button>
                                            </div>
                                        </li>
                                    ))}
                                    {/* TOTAL */}
                                    <li style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#333', fontWeight: 'bold', fontSize: '1.2em' }}>
                                        <span style={{color: 'white'}}>Total a Pagar:</span>
                                        <span style={{color: '#4caf50'}}>${totalTicket.toFixed(2)}</span>
                                    </li>
                                </ul>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitButton} 
                            style={{width: '100%', marginTop: '10px', backgroundColor: 'var(--color-accent)', color: 'black', fontSize: '1.1em', padding: '15px'}} 
                            disabled={loading || ticket.length === 0}
                        >
                            {loading ? 'Registrando...' : '✅ Cobrar Ticket'}
                        </button>
                    </form>
                </div>
            </div>
        </BarberLayout>
    );
};

export default NuevoServicioPage;