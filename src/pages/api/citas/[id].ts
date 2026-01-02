import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) return res.status(400).json({ message: 'ID requerido' });

    // ==========================================
    // MÉTODO PUT: ACTUALIZAR CITA
    // ==========================================
    if (req.method === 'PUT') {
        const { 
            estado, 
            metodo_pago, 
            // Datos opcionales para edición completa:
            fecha, hora, id_bar, id_serv, observaciones 
        } = req.body;

        try {
            // CASO 1: EDICIÓN COMPLETA (Viene del Modal de Editar)
            // Si nos mandan fecha y hora, asumimos que es una edición completa
            if (fecha && hora) {
                await db.query(`
                    UPDATE cita SET 
                        fecha = $1,
                        hora = $2,
                        id_bar = $3,
                        id_serv = $4,
                        estado = $5,
                        observaciones = $6
                    WHERE id_cita = $7
                `, [
                    fecha, 
                    hora, 
                    parseInt(id_bar), 
                    parseInt(id_serv), 
                    estado, 
                    observaciones || '', 
                    id
                ]);
                return res.status(200).json({ message: 'Cita editada completamente' });
            }

            // CASO 2: CAMBIO DE ESTADO RÁPIDO (Botones de la Agenda)
            else if (estado) {
                // Si mandamos metodo_pago (Cobro), actualizamos ambos
                if (metodo_pago) {
                    await db.query('UPDATE cita SET estado = $1, metodo_pago = $2 WHERE id_cita = $3', [estado, metodo_pago, id]);
                } else {
                    // Si solo es cambio de estado (ej: No Asistió)
                    await db.query('UPDATE cita SET estado = $1 WHERE id_cita = $2', [estado, id]);
                }
                return res.status(200).json({ message: 'Estado actualizado' });
            }

        } catch (error: any) {
            console.error("Error al actualizar cita:", error);
            return res.status(500).json({ message: 'Error interno al actualizar', detail: error.message });
        }
    }

    // ==========================================
    // MÉTODO DELETE: ELIMINAR CITA
    // ==========================================
    if (req.method === 'DELETE') {
        try {
            await db.query('DELETE FROM cita WHERE id_cita = $1', [id]);
            return res.status(200).json({ message: 'Cita eliminada y horario liberado' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al eliminar cita' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}