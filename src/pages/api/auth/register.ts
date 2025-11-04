// src/pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Importa tu conexión a la DB
import bcrypt from 'bcryptjs'; // Importa bcrypt para hashear

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // Solo aceptamos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { nom_bar, apell_bar, tel_bar, edad_bar, email, password, posicion } = req.body;

    // --- Validación de Entradas ---
    if (!nom_bar || !apell_bar || !tel_bar || !edad_bar || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // --- 1. Verificar si el email ya existe ---
        const checkUserQuery = 'SELECT * FROM barber WHERE email = $1';
        const existingUser = await db.query(checkUserQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        // --- 2. Hashear la contraseña (RNF-2) ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- 3. Insertar el nuevo barbero (Usuario) ---
        const insertQuery = `
            INSERT INTO barber 
                (nom_bar, apell_bar, tel_bar, edad_bar, email, password, posicion, estado)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, 'Activo')
            RETURNING id_bar, nom_bar, email; 
        `;
        const values = [
            nom_bar, 
            apell_bar, 
            tel_bar, 
            parseInt(edad_bar, 10), 
            email, 
            hashedPassword, 
            posicion || 'Barbero' // 'Barbero' por defecto si no se especifica
        ];
        
        const result = await db.query(insertQuery, values);

        return res.status(201).json({ message: 'Barbero registrado exitosamente', user: result.rows[0] });

    } catch (error: any) {
        console.error("Error en API al registrar barbero:", error);
        // Manejamos errores de la DB (ej. restricción CHECK)
        if (error.code === '23514') {
             return res.status(400).json({ message: `Dato inválido: ${error.constraint}` });
        }
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}