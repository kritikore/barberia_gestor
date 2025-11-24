// src/pages/api/auth/login.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y Contraseña son obligatorios.' });
    }

    try {
        // 1. Buscar al usuario por Email
        const query = 'SELECT * FROM barber WHERE email = $1';
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // 2. Comparar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 3. Determinar Rol
        const userRole = (user.posicion === 'Administrador' || user.email === 'admin@barberia.com') ? 'admin' : 'barbero';
        
        // 4. Responder éxito
        res.status(200).json({
            message: 'Login exitoso',
            user: {
                id: user.id_bar,
                email: user.email,
                nombre: user.nom_bar,
                role: userRole
            }
        });

    } catch (error: any) {
        console.error("Error en API de Login:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}