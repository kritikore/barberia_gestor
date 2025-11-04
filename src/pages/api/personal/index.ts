// src/pages/api/personal/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // --- MÉTODO GET: Listar todo el personal ---
    if (req.method === 'GET') {
        try {
            // Consulta que une barberos con sus servicios del mes actual
            const query = `
                SELECT 
                    b.*, 
                    COALESCE(COUNT(sr.id_dese), 0) AS "serviciosMes",
                    COALESCE(SUM(sr.total), 0) AS "ingresosGenerados"
                FROM barber b
                LEFT JOIN SERVICIO_REALIZADO sr 
                    ON b.id_bar = sr.id_bar
                    AND EXTRACT(MONTH FROM sr.FECHA) = EXTRACT(MONTH FROM CURRENT_DATE)
                    AND EXTRACT(YEAR FROM sr.FECHA) = EXTRACT(YEAR FROM CURRENT_DATE)
                GROUP BY b.id_bar
                ORDER BY b.estado ASC, b.nom_bar ASC;
            `;
            const result = await db.query(query);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error("Error en API (GET personal):", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    // --- MÉTODO POST: Crear nuevo barbero ---
    if (req.method === 'POST') {
        const { nom_bar, apell_bar, tel_bar, edad_bar, email, password, posicion, estado } = req.body;

        if (!nom_bar || !apell_bar || !tel_bar || !email || !password) {
            return res.status(400).json({ message: 'Nombre, apellido, teléfono, email y contraseña son obligatorios.' });
        }

        try {
            // Hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = `
                INSERT INTO barber (nom_bar, apell_bar, tel_bar, edad_bar, email, password, posicion, estado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *; 
            `;
            const values = [nom_bar, apell_bar, tel_bar, parseInt(edad_bar, 10), email, hashedPassword, posicion, estado || 'Activo'];
            
            const result = await db.query(query, values);
            return res.status(201).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API (POST personal):", error);
            if (error.code === '23505') { // Error de email único
                 return res.status(409).json({ message: 'Error: El email ya está registrado.' });
            }
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    
    return res.status(405).json({ message: 'Método no permitido' });
}