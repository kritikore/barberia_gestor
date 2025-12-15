import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaSave, FaUser, FaHistory, FaCut } from 'react-icons/fa';

interface Props {
    clientId: number;
    onClose: () => void;
    onUpdateSuccess: () => void;
}

const ClientDetailModal: React.FC<Props> = ({ clientId, onClose, onUpdateSuccess }) => {
    const [activeTab, setActiveTab] = useState<'perfil' | 'historial'>('perfil');
    const [loading, setLoading] = useState(true);
    const [barberos, setBarberos] = useState<any[]>([]);
    
    // Datos
    const [perfil, setPerfil] = useState<any>(null);
    const [historial, setHistorial] = useState<any[]>([]);
    
    // Formulario de edición
    const [formData, setFormData] = useState({
        nom_clie: '', apell_clie: '', tel_clie: '', email_clie: '', ocupacion: '', edad_clie: '', id_bar: ''
    });

    // Cargar datos al abrir
    useEffect(() => {
        if (!clientId) return; // Seguridad extra

        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Cargar Cliente y Historial
                const resCli = await fetch(`/api/clientes/${clientId}`);
                if (!resCli.ok) throw new Error("Error al cargar cliente");
                
                const dataCli = await resCli.json();
                
                // Asignamos datos
                setPerfil(dataCli.perfil);
                setHistorial(dataCli.historial || []); // Array vacío si no hay historial
                
                // Llenar formulario si existe el perfil
                if (dataCli.perfil) {
                    setFormData({
                        nom_clie: dataCli.perfil.nom_clie || '',
                        apell_clie: dataCli.perfil.apell_clie || '',
                        tel_clie: dataCli.perfil.tel_clie || '',
                        email_clie: dataCli.perfil.email_clie || '',
                        ocupacion: dataCli.perfil.ocupacion || '',
                        edad_clie: dataCli.perfil.edad_clie || '',
                        id_bar: dataCli.perfil.id_bar || ''
                    });
                }

                // 2. Cargar lista de Barberos
                const resBar = await fetch('/api/personal');
                if (resBar.ok) setBarberos(await resBar.json());

            } catch (e) { 
                console.error(e); 
            } finally { 
                setLoading(false); 
            }
        };
        loadData();
    }, [clientId]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/clientes/${clientId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
            if(res.ok) {
                alert("✅ Perfil actualizado");
                onUpdateSuccess();
                onClose();
            } else {
                alert("Error al guardar cambios");
            }
        } catch(e) { alert("Error de conexión"); }
    };

    // 🛡️ BLOQUEOS DE SEGURIDAD (Esto evita el error que te salió)
    if (loading) {
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent} style={{color:'white', textAlign:'center'}}>
                    Cargando perfil...
                </div>
            </div>
        );
    }

    // Si terminó de cargar pero NO encontró el perfil (ej. eliminado o error), no renderiza el HTML que falla
    if (!perfil) {
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent} style={{color:'white', textAlign:'center'}}>
                    <p>⚠️ No se encontraron datos del cliente.</p>
                    <button onClick={onClose} className={styles.closeButton} style={{position:'static', marginTop:10}}>Cerrar</button>
                </div>
            </div>
        );
    }

    // RENDERIZADO SEGURO
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{maxWidth: '700px'}}>
                
                {/* HEADER CON FOTO */}
                <div style={{display:'flex', gap: 20, alignItems:'center', borderBottom:'1px solid #444', paddingBottom: 20, marginBottom: 20}}>
                    <div style={{width: 80, height: 80, borderRadius: '50%', overflow:'hidden', border: '3px solid var(--color-accent)', flexShrink: 0}}>
                        {perfil.foto_base64 ? (
                            <img src={`data:image/jpeg;base64,${perfil.foto_base64}`} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Perfil" />
                        ) : (
                            <div style={{width:'100%', height:'100%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <FaUser size={30} color="#666"/>
                            </div>
                        )}
                    </div>
                    <div>
                        {/* 🛡️ Usamos '?.' para seguridad extra, aunque el 'if(!perfil)' de arriba ya lo protege */}
                        <h2 style={{margin:0, color:'white'}}>{perfil?.nom_clie} {perfil?.apell_clie}</h2>
                        <span style={{color:'var(--color-accent)'}}>{perfil?.ocupacion || 'Cliente'}</span>
                    </div>
                    <button onClick={onClose} style={{marginLeft:'auto', background:'none', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer'}}><FaTimes/></button>
                </div>

                {/* TABS */}
                <div style={{display:'flex', gap: 10, marginBottom: 20}}>
                    <button onClick={() => setActiveTab('perfil')} style={{padding: '10px 20px', background: activeTab==='perfil'?'var(--color-accent)':'#333', color: activeTab==='perfil'?'black':'white', border:'none', borderRadius:'20px', fontWeight:'bold', cursor:'pointer'}}>
                        <FaUser style={{marginRight:5}}/> Editar Perfil
                    </button>
                    <button onClick={() => setActiveTab('historial')} style={{padding: '10px 20px', background: activeTab==='historial'?'var(--color-accent)':'#333', color: activeTab==='historial'?'black':'white', border:'none', borderRadius:'20px', fontWeight:'bold', cursor:'pointer'}}>
                        <FaHistory style={{marginRight:5}}/> Historial Cortes
                    </button>
                </div>

                {/* CONTENIDO: PERFIL */}
                {activeTab === 'perfil' && (
                    <form onSubmit={handleUpdate}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Nombre</label>
                                <input className={styles.input} value={formData.nom_clie} onChange={e=>setFormData({...formData, nom_clie:e.target.value})} required/>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Apellido</label>
                                <input className={styles.input} value={formData.apell_clie} onChange={e=>setFormData({...formData, apell_clie:e.target.value})} required/>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Teléfono</label>
                                <input className={styles.input} value={formData.tel_clie} onChange={e=>setFormData({...formData, tel_clie:e.target.value})} required/>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Edad</label>
                                <input className={styles.input} type="number" value={formData.edad_clie} onChange={e=>setFormData({...formData, edad_clie:e.target.value})} required/>
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                             <label>Ocupación</label>
                             <input className={styles.input} value={formData.ocupacion} onChange={e=>setFormData({...formData, ocupacion:e.target.value})} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Barbero Asignado (Cartera)</label>
                            <select className={styles.input} value={formData.id_bar} onChange={e=>setFormData({...formData, id_bar:e.target.value})}>
                                <option value="">-- Sin Asignar --</option>
                                {barberos.map(b => (
                                    <option key={b.id_bar} value={b.id_bar}>{b.nom_bar} {b.apell_bar}</option>
                                ))}
                            </select>
                            <small style={{color:'#888', marginTop: 5, display:'block'}}>Este cliente aparecerá en la cartera del barbero seleccionado.</small>
                        </div>

                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitButton} style={{background: '#0D6EFD', width:'100%'}}>
                                <FaSave /> Guardar Cambios
                            </button>
                        </div>
                    </form>
                )}

                {/* CONTENIDO: HISTORIAL */}
                {activeTab === 'historial' && (
                    <div style={{maxHeight: '300px', overflowY:'auto', border:'1px solid #333', borderRadius: 6}}>
                        {historial.length === 0 ? (
                            <p style={{color:'#aaa', textAlign:'center', padding: 20}}>No hay servicios registrados aún.</p>
                        ) : (
                            <table style={{width:'100%', borderCollapse:'collapse', color:'#ddd'}}>
                                <thead>
                                    <tr style={{background: '#222', textAlign:'left'}}>
                                        <th style={{padding:12}}>Fecha</th>
                                        <th style={{padding:12}}>Servicio</th>
                                        <th style={{padding:12}}>Barbero</th>
                                        <th style={{padding:12}}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((h, i) => (
                                        <tr key={i} style={{borderBottom:'1px solid #333'}}>
                                            <td style={{padding:12}}>{new Date(h.fecha).toLocaleDateString()}</td>
                                            <td style={{padding:12}}><FaCut style={{marginRight:5}}/> {h.servicio}</td>
                                            <td style={{padding:12}}>{h.nom_bar}</td>
                                            <td style={{padding:12, color:'#4caf50'}}>${h.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDetailModal;