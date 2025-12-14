// src/utils/whatsapp.ts

export const sendWhatsAppReminder = (
    telefono: string, 
    mensajePersonalizado: string 
) => {
    // Limpiamos el teléfono (quitamos caracteres no numéricos)
    const phone = telefono.replace(/\D/g, ''); 
    
    // Asumimos código de país (ajusta si es necesario, ej. 52 para México)
    // Si el teléfono ya tiene 12 dígitos, asumimos que tiene lada.
    const fullPhone = phone.length === 10 ? `52${phone}` : phone;

    // Generamos la URL
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(mensajePersonalizado)}`;
    
    // Abrimos en nueva pestaña
    window.open(url, '_blank');
};