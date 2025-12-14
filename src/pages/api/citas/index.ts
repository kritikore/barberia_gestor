// src/pages/api/citas/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';


    // --- MÉTODO GET: Listar todas las citas (para la agenda) ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {    
    // --- MÉTODO GET: Listar citas (Con filtro opcional por Barbero) ---
    if (req.method === 'GET') {
        try {
            const { barberoId } = req.query; // 🔑 Leemos si hay un filtro

            let query = `
                SELECT 
                    c.id_cita, c.fecha, c.hora, c.estado,
                    cl.nom_clie || ' ' || cl.apell_clie AS nombre_cliente,
                    b.nom_bar || ' ' || b.apell_bar AS nombre_barbero,
                    s.tipo AS nombre_servicio,
                    c.id_bar -- Necesitamos el ID para saber de quien es
                FROM cita c
                JOIN cliente cl ON c.id_clie = cl.id_clie
                JOIN barber b ON c.id_bar = b.id_bar
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.fecha >= CURRENT_DATE 
            `;

            const values = [];

            // 🔑 Si se pasa un ID, filtramos. Si no (Admin), mostramos todo.
            if (barberoId) {
                query += ` AND c.id_bar = $1`;
                values.push(barberoId);
            }

            query += ` ORDER BY c.fecha, c.hora ASC;`;

            const result = await db.query(query, values);
            return res.status(200).json(result.rows);

        } catch (error: any) {
            // ... manejo de errores ...
        }
    }

    // --- MÉTODO POST: Crear nueva cita (REQ-C1) ---
    if (req.method === 'POST') {
        const { id_clie, id_bar, id_serv, fecha, hora } = req.body;

        if (!id_clie || !id_bar || !id_serv || !fecha || !hora) {
            return res.status(400).json({ message: 'Cliente, Barbero, Servicio, Fecha y Hora son obligatorios.' });
        }

        try {
            // 🔑 REQ-C2: Verificación de disponibilidad (gracias al UNIQUE (id_bar, fecha, hora))
            const query = `
                INSERT INTO cita (id_clie, id_bar, id_serv, fecha, hora, estado)
                VALUES ($1, $2, $3, $4, $5, 'Confirmada')
                RETURNING *; 
            `;
            const values = [id_clie, id_bar, id_serv, fecha, hora];
            
            const result = await db.query(query, values);
            
            // 🔑 REQ-C5 (Parcial): Aquí iría la lógica de notificación
            // ... (código de notificación omitido por brevedad) ...

            return res.status(201).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al crear cita:", error);
            // 🔑 Error de REQ-C2: Si el horario está ocupado
            if (error.code === '23505') { // Error de UNIQUE constraint
                 return res.status(409).json({ message: 'Error: El barbero ya tiene una cita en esa fecha y hora.' });
            }
            return res.status(500).json({ message: 'Error al crear la cita', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}
