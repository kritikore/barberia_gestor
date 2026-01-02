import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaSave, FaCamera, FaUser } from 'react-icons/fa';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    fixedBarberId?: number; 
}

const ClientModal: React.FC<Props> = ({ onClose, onSuccess, fixedBarberId }) => {
    
    // Estado para los datos
    const [formData, setFormData] = useState({
        nom_clie: '',
        apell_clie: '',
        tel_clie: '',
        email_clie: '',
        ocupacion: '',
        edad_clie: '',
        id_bar: fixedBarberId ? String(fixedBarberId) : '', 
    });
    
    // Guardamos la foto ya convertida en Base64 para enviar y visualizar
    const [fotoBase64, setFotoBase64] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [barberos, setBarberos] = useState<any[]>([]);

    // Cargar barberos
    useEffect(() => {
        if (!fixedBarberId) {
            fetch('/api/personal')
                .then(res => res.json())
                .then(data => setBarberos(data))
                .catch(err => console.error(err));
        }
    }, [fixedBarberId]);

    // 🔄 UTILIDAD: Convertir archivo a Base64 (Promesa)
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return alert("Imagen muy pesada (Máx 2MB)");
            
            try {
                // Convertimos a base64 inmediatamente
                const base64 = await fileToBase64(file);
                setFotoBase64(base64);
            } catch (error) {
                console.error("Error al procesar imagen", error);
            }
        }
    };

    // 🚀 ENVÍO COMO JSON (Compatible con Vercel Serverless)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Preparamos el payload como objeto simple
        const payload = {
            nom_clie: formData.nom_clie,
            apell_clie: formData.apell_clie,
            tel_clie: formData.tel_clie,
            email_clie: formData.email_clie,
            ocupacion: formData.ocupacion,
            edad_clie: parseInt(formData.edad_clie), // Aseguramos número
            id_bar: formData.id_bar ? parseInt(formData.id_bar) : null,
            foto: fotoBase64 || null // Enviamos el string base64 o null
        };

        try {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // ⚠️ Importante: Ahora es JSON
                },
                body: JSON.stringify(payload) 
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al registrar');
            }

            alert("✅ Cliente registrado exitosamente");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <div className={styles.modalHeader}>
                    <h2 style={{ color: 'var(--color-accent)' }}>Nuevo Cliente</h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* FOTO */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', 
                            overflow: 'hidden', border: '3px solid var(--color-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: '#333', marginBottom: '10px'
                        }}>
                            {fotoBase64 ? (
                                <img src={fotoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : <FaUser size={40} color="#666" />}
                        </div>
                        <label style={{ cursor: 'pointer', background: '#2A2A2A', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9em', color: 'white', border: '1px solid #444', display:'flex', gap:5, alignItems:'center' }}>
                            <FaCamera /> Subir Foto
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        </label>
                    </div>

                    {/* CAMPOS */}
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Nombre *</label>
                            <input className={styles.input} required value={formData.nom_clie} onChange={e => setFormData({...formData, nom_clie: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Apellido *</label>
                            <input className={styles.input} required value={formData.apell_clie} onChange={e => setFormData({...formData, apell_clie: e.target.value})} />
                        </div>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Teléfono *</label>
                            <input className={styles.input} type="tel" required value={formData.tel_clie} onChange={e => setFormData({...formData, tel_clie: e.target.value})} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Edad *</label>
                            <input className={styles.input} type="number" required value={formData.edad_clie} onChange={e => setFormData({...formData, edad_clie: e.target.value})} />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input className={styles.input} type="email" value={formData.email_clie} onChange={e => setFormData({...formData, email_clie: e.target.value})} />
                    </div>
                    
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Ocupación</label>
                            <input className={styles.input} value={formData.ocupacion} onChange={e => setFormData({...formData, ocupacion: e.target.value})} />
                        </div>

                        {!fixedBarberId && (
                            <div className={styles.formGroup}>
                                <label>Asignar a Barbero</label>
                                <select className={styles.input} value={formData.id_bar} onChange={e => setFormData({...formData, id_bar: e.target.value})}>
                                    <option value="">-- Sin Asignar --</option>
                                    {barberos.map((b: any) => (
                                        <option key={b.id_bar} value={b.id_bar}>{b.nom_bar} {b.apell_bar}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} disabled={loading} style={{background: 'var(--color-accent)', color:'black'}}>
                            <FaSave /> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;