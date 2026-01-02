import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // 1. Validar método
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { email, password } = req.body;

    // 2. Validar campos vacíos
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y Contraseña son obligatorios.' });
    }

    try {
        // 3. Buscar al usuario por Email en la tabla 'barber'
        const query = 'SELECT * FROM barber WHERE email = $1';
        const result = await db.query(query, [email]);

        // Si no existe el usuario
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // 4. Comparar la contraseña (hash)
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // 5. Determinar Rol (Lógica personalizada)
        // Asume 'admin' si la posición es Administrador o es el correo del jefe
        const userRole = (user.posicion === 'Administrador' || user.email === 'admin@barberia.com') ? 'admin' : 'barbero';
        
        // 6. Responder éxito
        // ⚠️ IMPORTANTE: Aquí devolvemos los nombres EXACTOS de la base de datos
        // para que el frontend (useBarbero hook) los pueda leer.
        res.status(200).json({
            message: 'Login exitoso',
            user: {
                id_bar: user.id_bar,   // 👈 CORREGIDO: Usamos id_bar
                nom_bar: user.nom_bar, // 👈 CORREGIDO: Usamos nom_bar
                email: user.email,
                role: userRole
            }
        });

    } catch (error: any) {
        console.error("Error en API de Login:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
        return res.status(500).json({ message: "Error interno", detail: error.message });
    }
}