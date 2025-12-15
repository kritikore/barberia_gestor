import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // PUT: Editar Cita
    if (req.method === 'PUT') {
        const { estado, observaciones, fecha, hora, id_bar, id_serv } = req.body;

        try {
            // OPCIÓN A: Reprogramación Completa (Si envías fecha, hora y barbero)
            if (fecha && hora && id_bar && id_serv) {
                await db.query(`
                    UPDATE cita 
                    SET fecha = $1, hora = $2, id_bar = $3, id_serv = $4, estado = $5, observaciones = $6
                    WHERE id_cita = $7
                `, [fecha, hora, id_bar, id_serv, estado, observaciones || 'Reprogramada por Admin', id]);
            } 
            // OPCIÓN B: Cambio Rápido de Estado (Solo estado)
            else {
                await db.query(`
                    UPDATE cita 
                    SET estado = $1, observaciones = $2
                    WHERE id_cita = $3
                `, [estado, observaciones, id]);
            }

            res.status(200).json({ message: 'Cita actualizada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la cita' });
        }
    }

    // DELETE: Eliminar Cita
    if (req.method === 'DELETE') {
        try {
            await db.query('DELETE FROM cita WHERE id_cita = $1', [id]);
            res.status(200).json({ message: 'Cita eliminada' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar' });
        }
    }
}