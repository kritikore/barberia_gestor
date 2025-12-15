import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEnvelope, FaTimes, FaSave } from 'react-icons/fa';

interface BarberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    barberoToEdit?: any; // Si viene null, es modo CREAR
}

const BarberModal: React.FC<BarberModalProps> = ({ isOpen, onClose, onSuccess, barberoToEdit }) => {
    const [formData, setFormData] = useState({
        nom_bar: '',
        apell_bar: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    // Si hay barbero para editar, llenamos el formulario
    useEffect(() => {
        if (barberoToEdit) {
            setFormData({
                nom_bar: barberoToEdit.nom_bar || '',
                apell_bar: barberoToEdit.apell_bar || '',
                email: barberoToEdit.email || '',
                password: '' // La contraseña se deja vacía por seguridad
            });
        } else {
            setFormData({ nom_bar: '', apell_bar: '', email: '', password: '' });
        }
    }, [barberoToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const method = barberoToEdit ? 'PUT' : 'POST';
            const url = barberoToEdit 
                ? `/api/personal/${barberoToEdit.id_bar}` 
                : '/api/personal';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Error en la operación");

            alert(barberoToEdit ? "✅ Barbero actualizado" : "✅ Barbero creado con inventario inicial");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Hubo un error al guardar los datos.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: '#1E1E1E', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px',
                border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ color: 'white', margin: 0 }}>{barberoToEdit ? 'Editar Barbero' : 'Nuevo Barbero'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div>
                        <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Nombre</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#2A2A2A', borderRadius: 6, padding: '0 10px', border: '1px solid #444' }}>
                            <FaUser color="#666" />
                            <input
                                required
                                style={{ background: 'transparent', border: 'none', color: 'white', padding: 10, width: '100%', outline: 'none' }}
                                value={formData.nom_bar}
                                onChange={e => setFormData({ ...formData, nom_bar: e.target.value })}
                                placeholder="Nombre"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Apellido</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#2A2A2A', borderRadius: 6, padding: '0 10px', border: '1px solid #444' }}>
                            <FaUser color="#666" />
                            <input
                                required
                                style={{ background: 'transparent', border: 'none', color: 'white', padding: 10, width: '100%', outline: 'none' }}
                                value={formData.apell_bar}
                                onChange={e => setFormData({ ...formData, apell_bar: e.target.value })}
                                placeholder="Apellido"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Email (Acceso)</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#2A2A2A', borderRadius: 6, padding: '0 10px', border: '1px solid #444' }}>
                            <FaEnvelope color="#666" />
                            <input
                                type="email"
                                required
                                style={{ background: 'transparent', border: 'none', color: 'white', padding: 10, width: '100%', outline: 'none' }}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="correo@barberia.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ color: '#ccc', fontSize: '0.9rem' }}>
                            {barberoToEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#2A2A2A', borderRadius: 6, padding: '0 10px', border: '1px solid #444' }}>
                            <FaLock color="#666" />
                            <input
                                type="password"
                                required={!barberoToEdit} // Solo obligatoria al crear
                                style={{ background: 'transparent', border: 'none', color: 'white', padding: 10, width: '100%', outline: 'none' }}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: 10, padding: 12, background: 'var(--color-accent)', color: 'black',
                            border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10
                        }}
                    >
                        {loading ? 'Guardando...' : <><FaSave /> Guardar Datos</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BarberModal;