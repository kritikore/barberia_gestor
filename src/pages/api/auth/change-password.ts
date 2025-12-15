import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

    const { id_bar, currentPassword, newPassword } = req.body;

    if (!id_bar || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // 1. Buscar al usuario
        const result = await db.query('SELECT * FROM barber WHERE id_bar = $1', [id_bar]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const user = result.rows[0];

        // 2. Verificar la contraseña ACTUAL
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
        }

        // 3. Encriptar la NUEVA contraseña
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Actualizar en BD
        await db.query('UPDATE barber SET password = $1 WHERE id_bar = $2', [newHashedPassword, id_bar]);

        res.status(200).json({ message: '✅ Contraseña actualizada correctamente' });

    } catch (error) {
        console.error("Error al cambiar password:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}