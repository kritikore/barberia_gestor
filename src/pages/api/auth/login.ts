import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { email, password } = req.body;

    try {
        // 1. Buscamos al usuario por email
        // IMPORTANTE: Traemos AMBAS columnas de contraseña ("pass_bar" y "password")
        const query = `
            SELECT id_bar, nom_bar, apell_bar, email, pass_bar, password, estado, posicion 
            FROM barber 
            WHERE email = $1
        `;
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        // 2. VERIFICACIÓN DE SEGURIDAD
        if (user.estado === 'Inactivo' || user.estado === 'Baja') {
            return res.status(403).json({ message: 'Usuario inactivo.' });
        }

        // --- CORRECCIÓN CLAVE AQUÍ ---
        // Definimos cuál es la contraseña real. 
        // Si 'pass_bar' está vacío, usamos 'password' (la columna vieja).
        const realPassword = user.pass_bar || user.password;

        if (!realPassword) {
            return res.status(400).json({ message: 'La cuenta no tiene contraseña configurada.' });
        }

        // 3. COMPARACIÓN DE CONTRASEÑA (Híbrida)
        let isValid = false;

        // Si empieza con $2... es encriptada (Bcrypt)
        if (realPassword.startsWith('$2') && realPassword.length >= 50) {
            isValid = await bcrypt.compare(password, realPassword);
        } else {
            // Si no, es texto plano (Cuentas viejas)
            if (password === realPassword) isValid = true;
        }

        if (!isValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // 4. DETERMINAR ROL
        let userRole = 'barbero';
        // Verificamos si la columna posicion tiene valor antes de usar .toLowerCase()
        if (user.posicion && (user.posicion.toLowerCase().includes('admin') || user.posicion.toLowerCase().includes('gerente'))) {
            userRole = 'admin';
        }

        // 5. RESPUESTA EXITOSA
        return res.status(200).json({
            message: 'Login exitoso',
            user: {
                id_bar: user.id_bar,
                nom_bar: user.nom_bar,
                apell_bar: user.apell_bar,
                email: user.email,
                role: userRole
            }
        });

    } catch (error: any) {
        console.error("Error en Login:", error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}