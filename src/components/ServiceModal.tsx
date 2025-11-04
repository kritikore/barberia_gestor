// src/components/ServiceModal.tsx
import React, { useState, useEffect } from 'react';
import styles from '@/styles/Modal.module.css';
import { FaTimes } from 'react-icons/fa';

// Interfaz (basada en la DB actualizada)
interface Servicio {
    id_serv?: number;
    tipo: string;
    precio: string;
    descripcion: string;
}

interface ServiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  serviceToEdit?: Servicio | null;
}

// 🔑 Lista de servicios sugeridos para el dropdown
const serviciosSugeridos = [
    "Corte de cabello",
    "Arreglo de barba y bigote",
    "Afeitado clásico",
    "Tratamientos capilares",
    "Tratamientos faciales",
    "Tintes",
    "Ondulación",
    "Manicura y pedicura",
    "Depilación (cejas)",
    "Masajes",
    "Diseños (corte)",
    "Otro" // Opción para escribir manualmente
];

const ServiceModal: React.FC<ServiceModalProps> = ({ onClose, onSuccess, serviceToEdit }) => {
    
    const [formData, setFormData] = useState({
        tipo: serviceToEdit?.tipo || serviciosSugeridos[0], // Inicia con el primer item
        tipoManual: '', // Para cuando seleccionan "Otro"
        precio: serviceToEdit?.precio || '',
        descripcion: serviceToEdit?.descripcion || '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const isEditing = !!serviceToEdit;

    // Estado para saber si mostramos el input manual
    const [mostrarTipoManual, setMostrarTipoManual] = useState(false);

    // 🔑 Actualiza el estado cuando el dropdown cambia
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        setFormData({ ...formData, tipo: selectedValue });
        
        if (selectedValue === 'Otro') {
            setMostrarTipoManual(true);
        } else {
            setMostrarTipoManual(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 🔑 Determina el nombre final del servicio
        const nombreServicioFinal = formData.tipo === 'Otro' ? formData.tipoManual.trim() : formData.tipo;

        if (!nombreServicioFinal || !formData.precio) {
            setError('El Nombre del Servicio y el Precio son obligatorios.');
            setLoading(false);
            return;
        }
        
        const dataToSend = {
            tipo: nombreServicioFinal,
            precio: formData.precio,
            descripcion: formData.descripcion
        };

        try {
            const url = isEditing ? `/api/servicios/${serviceToEdit.id_serv}` : '/api/servicios';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), 
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Error al guardar el servicio');
            }

            setLoading(false);
            onSuccess(); 
            onClose(); 

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 style={{ color: 'var(--color-accent)' }}>
                        {isEditing ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    {/* 🔑 CAMBIO: Input a Select (Dropdown) */}
                    <div className={styles.formGroup}>
                        <label>Nombre del Servicio (Tipo)</label>
                        <select value={formData.tipo} onChange={handleSelectChange}>
                            {serviciosSugeridos.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* 🔑 Campo manual si seleccionan "Otro" */}
                    {mostrarTipoManual && (
                        <div className={styles.formGroup}>
                            <label>Escribe el nombre del nuevo servicio:</label>
                            <input name="tipoManual" value={formData.tipoManual} onChange={handleChange} required />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>Precio (Ej: 250.00)</label>
                        <input name="precio" value={formData.precio} onChange={handleChange} type="number" step="0.01" required />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Descripción (Opcional)</label>
                        <textarea 
                            name="descripcion" 
                            value={formData.descripcion} 
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            rows={3}
                            style={{ padding: '10px', border: '1px solid #444', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)', borderRadius: '6px', fontSize: '1em', resize: 'vertical' }}
                        />
                    </div>
                    
                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }} disabled={loading}>
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Añadir Servicio')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceModal;