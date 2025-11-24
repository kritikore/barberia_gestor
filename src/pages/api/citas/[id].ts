// src/pages/api/citas/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // --- MÉTODO PUT: Actualizar Estado (Completar/Cancelar) ---
    if (req.method === 'PUT') {
        const { estado, observaciones } = req.body;

        if (!estado) {
            return res.status(400).json({ message: 'El nuevo "estado" es obligatorio.' });
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN'); // Iniciar Transacción

            // 1. Actualizar el estado de la cita
            const updateCitaQuery = `
                UPDATE cita 
                SET estado = $1, observaciones = $2 
                WHERE id_cita = $3 
                RETURNING *;
            `;
            const citaResult = await client.query(updateCitaQuery, [estado, observaciones, id]);
            
            if (citaResult.rowCount === 0) {
                throw new Error('Cita no encontrada');
            }
            
            const cita = citaResult.rows[0];

            // 🔑 REQ-C5: Si se completa, registrar en SERVICIO_REALIZADO
            if (estado === 'Completada') {
                
                // Obtener precio del servicio
                const servicioRes = await client.query('SELECT precio FROM servicio WHERE id_serv = $1', [cita.id_serv]);
                const precioServicio = servicioRes.rows[0].precio;

                // Crear DETALLE_SERVICIO
                const detalleRes = await client.query(
                    'INSERT INTO DETALLE_SERVICIO (ID_SERV) VALUES ($1) RETURNING ID_DESE', 
                    [cita.id_serv]
                );
                const id_dese_nuevo = detalleRes.rows[0].id_dese;

                // Crear SERVICIO_REALIZADO (Bitácora)
                const servicioRealizadoQuery = `
                    INSERT INTO SERVICIO_REALIZADO (ID_DESE, FECHA, TOTAL, ID_BAR, ID_CLIE)
                    VALUES ($1, $2, $3, $4, $5);
                `;
                await client.query(servicioRealizadoQuery, [
                    id_dese_nuevo,
                    cita.fecha, 
                    precioServicio, 
                    cita.id_bar,
                    cita.id_clie
                ]);
            }
            
            await client.query('COMMIT'); 
            res.status(200).json(citaResult.rows[0]);

        } catch (error: any) {
            await client.query('ROLLBACK'); 
            console.error("Error en API (PUT cita):", error);
            res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        } finally {
            client.release();
        }
    }
    
    return res.status(405).json({ message: 'Método no permitido' });
}