import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // ---------------------------------------------------------
    // 1. MÉTODO GET: LISTAR CITAS (Con nombres seguros)
    // ---------------------------------------------------------
    if (req.method === 'GET') {
        try {
            const result = await db.query(`
                SELECT 
                    c.*, 
                    b.nom_bar, 
                    b.apell_bar,
                    -- ✅ FIX: Usamos CONCAT para evitar que un NULL rompa todo el string
                    CONCAT(b.nom_bar, ' ', b.apell_bar) as nombre_barbero,
                    CONCAT(cl.nom_clie, ' ', cl.apell_clie) as nombre_cliente,
                    s.tipo as nombre_servicio,
                    s.precio
                FROM cita c
                LEFT JOIN barber b ON c.id_bar = b.id_bar
                LEFT JOIN cliente cl ON c.id_clie = cl.id_clie
                LEFT JOIN servicio s ON c.id_serv = s.id_serv
                ORDER BY c.fecha DESC, c.hora ASC
            `);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error("Error al listar citas:", error);
            return res.status(500).json({ message: 'Error al obtener lista de citas' });
        }
    }

    // ---------------------------------------------------------
    // 2. MÉTODO POST: CREAR CITA Y DESCONTAR STOCK
    // ---------------------------------------------------------
    if (req.method === 'POST') {
        const { id_clie, id_bar, id_serv, fecha, hora, observaciones } = req.body;

        if (!id_clie || !id_bar || !id_serv || !fecha || !hora) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }

        try {
            const estadoInicial = 'Pendiente';
            const insertResult = await db.query(`
                INSERT INTO cita (id_clie, id_bar, id_serv, fecha, hora, observaciones, estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id_cita
            `, [id_clie, id_bar, id_serv, fecha, hora, observaciones || '', estadoInicial]);

            const nuevaCitaId = insertResult.rows[0].id_cita;

            // Descontar Stock
            await db.query(`
                UPDATE barber SET 
                    st_navajas = GREATEST(0, st_navajas - 1),
                    st_papel = GREATEST(0, st_papel - 1),
                    st_talco = GREATEST(0, st_talco - 1),
                    st_aftershave = GREATEST(0, st_aftershave - 1),
                    st_desinfectante = GREATEST(0, st_desinfectante - 1)
                WHERE id_bar = $1
            `, [id_bar]);

            return res.status(200).json({ message: 'Cita creada exitosamente', id_cita: nuevaCitaId });

        } catch (error: any) {
            console.error("❌ Error API Citas:", error);
            return res.status(500).json({ message: 'Error al procesar la cita', detail: error.message });
        }
    }

    // ---------------------------------------------------------
    // 3. MÉTODO PUT: EDITAR CITA (Faltaba esto para el Modal)
    // ---------------------------------------------------------
    if (req.method === 'PUT') {
        // Nota: Idealmente el PUT debería ir a /api/citas/[id], pero si tu frontend llama aquí, lo manejamos.
        // Revisa si tu frontend llama a /api/citas o /api/citas/[id].
        // Si llama a /api/citas/[id], este bloque NO se ejecutará aquí, sino en el archivo [id].ts.
        
        // Asumiendo que quizás lo envías sin ID en la URL por error:
        return res.status(405).json({ message: 'Para editar usa /api/citas/[id]' });
    }

    return res.status(405).json({ message: 'Método no permitido' });
}