import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes, FaSave, FaCamera, FaUser } from 'react-icons/fa';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    fixedBarberId?: number; 
}

const ClientModal: React.FC<Props> = ({ onClose, onSuccess, fixedBarberId }) => {
    
    // Estado para los datos de texto (y la URL de la foto para previsualizar)
    const [formData, setFormData] = useState({
        nom_clie: '',
        apell_clie: '',
        tel_clie: '',
        email_clie: '',
        ocupacion: '',
        edad_clie: '',
        id_bar: fixedBarberId ? String(fixedBarberId) : '', 
        fotoPreview: '' // Usamos esto solo para mostrar la imagen en pantalla
    });
    
    // 📸 NUEVO ESTADO: Aquí guardamos el archivo real para enviarlo
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [barberos, setBarberos] = useState<any[]>([]);

    // Cargar barberos SOLO si no hay un ID fijo
    useEffect(() => {
        if (!fixedBarberId) {
            fetch('/api/personal')
                .then(res => res.json())
                .then(data => setBarberos(data))
                .catch(err => console.error(err));
        }
    }, [fixedBarberId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return alert("Imagen muy pesada (Máx 2MB)");
            
            // 1. Guardamos el archivo real para el envío
            setSelectedFile(file);

            // 2. Creamos la vista previa para el usuario
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, fotoPreview: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    // 🚀 CORRECCIÓN PRINCIPAL AQUÍ: Usamos FormData
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        
        // Agregamos los textos
        data.append('nom_clie', formData.nom_clie);
        data.append('apell_clie', formData.apell_clie);
        data.append('tel_clie', formData.tel_clie);
        data.append('email_clie', formData.email_clie);
        data.append('ocupacion', formData.ocupacion);
        data.append('edad_clie', formData.edad_clie);
        
        if (formData.id_bar) {
            data.append('id_bar', formData.id_bar);
        }

        // Agregamos el archivo (Si existe)
        if (selectedFile) {
            data.append('foto', selectedFile);
        }

        try {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                // ⚠️ NOTA: No agregamos 'Content-Type', el navegador lo pone solo con FormData
                body: data 
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
                            {formData.fotoPreview ? (
                                <img src={formData.fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

                        {/* Si NO hay ID fijo, mostramos el selector */}
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