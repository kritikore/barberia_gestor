import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) return res.status(400).json({ message: 'ID de cita requerido' });

    // 1. ELIMINAR CITA (DELETE)
    if (req.method === 'DELETE') {
        try {
            await db.query('DELETE FROM cita WHERE id_cita = $1', [id]);
            return res.status(200).json({ message: 'Cita eliminada correctamente' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al eliminar la cita' });
        }
    }

    // 2. ACTUALIZAR / COBRAR CITA (PUT) - ¡AQUÍ ESTÁ LA MAGIA DE LOS INSUMOS!
    if (req.method === 'PUT') {
        try {
            const { estado, metodo_pago } = req.body;

            // Primero verificamos el estado actual para no descontar dos veces si ya estaba completada
            const checkQuery = 'SELECT * FROM cita WHERE id_cita = $1';
            const checkRes = await db.query(checkQuery, [id]);
            
            if (checkRes.rows.length === 0) return res.status(404).json({ message: 'Cita no encontrada' });
            
            const citaActual = checkRes.rows[0];
            const esNuevoCobro = (estado === 'Completada' || estado === 'Pagado') && 
                                 (citaActual.estado !== 'Completada' && citaActual.estado !== 'Pagado');

            // Actualizamos el estado de la cita
            await db.query(
                `UPDATE cita SET estado = $1, metodo_pago = $2 WHERE id_cita = $3`,
                [estado, metodo_pago || citaActual.metodo_pago, id]
            );

            // === 🔥 DESCUENTO AUTOMÁTICO DE INSUMOS 🔥 ===
            // Solo si estamos marcando la cita como COMPLETADA por primera vez
            if (esNuevoCobro && citaActual.id_bar) {
                console.log(`Descontando insumos al barbero ${citaActual.id_bar}...`);
                await db.query(`
                    UPDATE barber SET 
                       UPDATE barber SET 
                        st_navajas = GREATEST(0, st_navajas - 1),
                        st_papel = GREATEST(0, st_papel - 1),
                        st_talco = GREATEST(0, st_talco - 1),       
                        st_aftershave = GREATEST(0, st_aftershave - 1),
                        st_desinfectante = GREATEST(0, st_desinfectante - 1)
                    WHERE id_bar = $1
                `, [citaActual.id_bar]);
            }

            return res.status(200).json({ message: 'Cita actualizada e insumos descontados' });

        } catch (error) {
            console.error("Error al actualizar cita:", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}