import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // --- OBTENER LISTA DE BARBEROS (GET) ---
    if (req.method === 'GET') {
        try {
            // Ordenamos por estado (Activos primero) y luego por nombre
            const query = `
                SELECT id_bar, nom_bar, apell_bar, tel_bar, email, estado 
                FROM barber 
                ORDER BY estado ASC, nom_bar ASC
            `;
            const result = await db.query(query);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error("Error al obtener personal:", error);
            return res.status(500).json({ message: 'Error al cargar la lista de personal' });
        }
    }

    // --- CREAR NUEVO BARBERO (POST) ---
    if (req.method === 'POST') {
        try {
            console.log("📝 Intentando crear barbero:", req.body); // Debug en consola del servidor

            const { nom_bar, apell_bar, tel_bar, email, pass_bar } = req.body;

            // 1. Validaciones básicas
            if (!nom_bar || !apell_bar || !email || !pass_bar) {
                return res.status(400).json({ message: 'Faltan datos obligatorios (Nombre, Apellido, Email o Contraseña).' });
            }

            // 2. Insertar en Base de Datos (Incluyendo tel_bar)
            const query = `
                INSERT INTO barber (nom_bar, apell_bar, tel_bar, email, pass_bar, estado)
                VALUES ($1, $2, $3, $4, $5, 'Activo')
                RETURNING id_bar;
            `;
            
            // Aseguramos que tel_bar no sea undefined (enviamos string vacío si no hay)
            const values = [nom_bar, apell_bar, tel_bar || '', email, pass_bar];

            await db.query(query, values);

            return res.status(201).json({ message: 'Barbero registrado exitosamente' });

        } catch (error: any) {
            console.error("Error al crear barbero:", error);
            
            // Error código 23505 en PostgreSQL significa "Llave duplicada" (Email repetido)
            if (error?.code === '23505') {
                return res.status(409).json({ message: 'Ese correo electrónico ya está registrado.' });
            }

            return res.status(500).json({ message: 'Error interno del servidor al crear barbero.' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}