import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // ... (Tu código GET existente para listar citas) ...
        const result = await db.query(`
            SELECT c.*, b.nom_bar, cl.nom_clie || ' ' || cl.apell_clie as nombre_cliente, s.tipo as nombre_servicio
            FROM cita c
            JOIN barber b ON c.id_bar = b.id_bar
            JOIN cliente cl ON c.id_clie = cl.id_clie
            JOIN servicio s ON c.id_serv = s.id_serv
        `);
        return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
        const { id_clie, id_bar, id_serv, fecha, hora, observaciones, estado } = req.body;

        try {
            // 1. Registrar la Cita
            await db.query(`
                INSERT INTO cita (id_clie, id_bar, id_serv, fecha, hora, observaciones, estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [id_clie, id_bar, id_serv, fecha, hora, observaciones, estado]);

            // 2. LÓGICA DE CONSUMO DE INSUMOS (SOLO SI ES CORTE/SERVICIO)
            // Asumimos que cualquier cita consume insumos básicos. 
            // Si solo es "Corte", podrías filtrar por id_serv.
            
            // Descontamos 1 unidad de cada insumo del barbero (ID REAL)
            await db.query(`
                UPDATE barber SET 
                    st_navajas = GREATEST(0, st_navajas - 1),
                    st_papel = GREATEST(0, st_papel - 1),
                    st_talco = GREATEST(0, st_talco - 1),
                    st_aftershave = GREATEST(0, st_aftershave - 1),
                    st_desinfectante = GREATEST(0, st_desinfectante - 1)
                WHERE id_bar = $1
            `, [id_bar]);

            return res.status(200).json({ message: 'Cita creada y stock descontado' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al procesar cita' });
        }
    }
}