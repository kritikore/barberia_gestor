// src/pages/api/clientes/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // --- MÉTODO POST: CREAR NUEVO CLIENTE ---
    if (req.method === 'POST') {
        const { nom_clie, apell_clie, tel_clie, edad_clie, ocupacion } = req.body;

        if (!nom_clie || !apell_clie || !tel_clie || !edad_clie || !ocupacion) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        try {
            // Asumimos un barbero por defecto o sacado de la sesión si implementas auth completo
            const id_bar_default = 1; 

            const query = `
                INSERT INTO cliente (nom_clie, apell_clie, tel_clie, edad_clie, ocupacion, id_bar)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *; 
            `;
            
            // IMPORTANTE: parseInt para la edad
            const values = [nom_clie, apell_clie, tel_clie, parseInt(edad_clie, 10), ocupacion, id_bar_default];
            
            const result = await db.query(query, values);

            return res.status(201).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al crear cliente:", error);
            // Manejo de errores de base de datos (ej. Constraints)
            if (error.code === '23514') {
                 return res.status(400).json({ message: 'Error: Datos inválidos. Verifica que el nombre/apellido no tengan caracteres especiales no permitidos.' });
            }
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // --- MÉTODO GET: LISTAR CLIENTES ---
   if (req.method === 'GET') {
        try {
            // 🔑 CORRECCIÓN: Hacemos un LEFT JOIN para contar las visitas (servicios realizados)
            const query = `
                SELECT 
                    c.*, 
                    COUNT(sr.ID_DESE) as "total_visitas"
                FROM cliente c
                LEFT JOIN SERVICIO_REALIZADO sr ON c.id_clie = sr.ID_CLIE
                GROUP BY c.id_clie
                ORDER BY c.id_clie DESC;
            `;
            const result = await db.query(query);
            
            // Convertimos total_visitas a número
            const clientes = result.rows.map(cli => ({
                ...cli,
                total_visitas: parseInt(cli.total_visitas, 10) || 0
            }));

            return res.status(200).json(clientes);
        } catch (error: any) {
            console.error("Error en API al listar clientes:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }}