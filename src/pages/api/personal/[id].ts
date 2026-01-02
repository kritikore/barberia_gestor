import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    
    // Validar ID
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: 'ID de barbero inválido' });
    }

    // --- ELIMINAR / DAR DE BAJA (DELETE) ---
    if (req.method === 'DELETE') {
        try {
            // 1. Verificamos si tiene historial (Citas o Ventas)
            const checkHistorial = await db.query(
                `SELECT 
                    (SELECT COUNT(*) FROM cita WHERE id_bar = $1) + 
                    (SELECT COUNT(*) FROM venta_producto WHERE id_bar = $1) as total`,
                [id]
            );
            
            const tieneHistorial = parseInt(checkHistorial.rows[0].total) > 0;

            if (tieneHistorial) {
                // BAJA LÓGICA: No borramos, solo desactivamos para no romper reportes contables
                await db.query("UPDATE barber SET estado = 'Inactivo' WHERE id_bar = $1", [id]);
                return res.status(200).json({ message: 'El barbero tiene historial. Se cambió su estado a Inactivo.' });
            } else {
                // BAJA FÍSICA: Si es nuevo y no vendió nada, lo borramos de verdad
                await db.query("DELETE FROM barber WHERE id_bar = $1", [id]);
                return res.status(200).json({ message: 'Barbero eliminado permanentemente.' });
            }

        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'Error al eliminar barbero' });
        }
    }

    // --- ACTUALIZAR DATOS (PUT) ---
    if (req.method === 'PUT') {
        try {
            const { nom_bar, apell_bar, tel_bar, email, pass_bar, estado } = req.body;

            // Validación básica
            if (!nom_bar || !email) {
                return res.status(400).json({ message: 'Nombre y Email son obligatorios' });
            }

            // LÓGICA DE CONTRASEÑA:
            // Si el campo pass_bar viene con texto, actualizamos TODO incluida la contraseña.
            // Si viene vacío, actualizamos todo MENOS la contraseña (mantenemos la vieja).
            
            let query = '';
            let values = [];

            if (pass_bar && pass_bar.trim() !== '') {
                // Caso A: Quiere cambiar contraseña
                query = `
                    UPDATE barber 
                    SET nom_bar = $1, 
                        apell_bar = $2, 
                        tel_bar = $3, 
                        email = $4, 
                        pass_bar = $5, 
                        estado = $6
                    WHERE id_bar = $7
                `;
                values = [nom_bar, apell_bar, tel_bar, email, pass_bar, estado, id];
            } else {
                // Caso B: Mantiene contraseña actual (No incluimos pass_bar en el UPDATE)
                query = `
                    UPDATE barber 
                    SET nom_bar = $1, 
                        apell_bar = $2, 
                        tel_bar = $3, 
                        email = $4, 
                        estado = $5
                    WHERE id_bar = $6
                `;
                values = [nom_bar, apell_bar, tel_bar, email, estado, id];
            }

            const result = await db.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Barbero no encontrado' });
            }

            return res.status(200).json({ message: 'Datos actualizados correctamente' });

        } catch (error: any) {
            console.error("Error al actualizar:", error);
            // Manejo de error de duplicados (ej: cambiar email a uno que ya existe)
            if (error.code === '23505') { 
                return res.status(409).json({ message: 'Ese correo electrónico ya está registrado por otro usuario.' });
            }
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}