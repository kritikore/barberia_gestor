import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("🏁 INICIANDO SCRIPT DE ADMIN...");

    const ADMIN_EMAIL = 'dev@gestor.com';
    const ADMIN_PASS_RAW = 'access';
    
    try {
        // 1. Generar Hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASS_RAW, salt);

        // 2. Borrar usuario anterior
        await db.query('DELETE FROM barber WHERE email = $1', [ADMIN_EMAIL]);

        // 3. Insertar Administrador
        // ⚠️ CAMBIO: En estado ponemos 'Activo' en lugar de true
        const query = `
            INSERT INTO barber (nom_bar, apell_bar, tel_bar, email, password, posicion, estado, edad_bar)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_bar, email, nom_bar, posicion;
        `;

        const values = [
            'Admin',            // 1. Nombre
            'Principal',        // 2. Apellido
            '5555555555',       // 3. Teléfono
            ADMIN_EMAIL,        // 4. Email
            hashedPassword,     // 5. Contraseña
            'Administrador',    // 6. Posición
            'Activo',           // 7. ESTADO (Corregido: Texto 'Activo')
            30                  // 8. Edad
        ];

        const result = await db.query(query, values);

        return res.status(200).json({ 
            message: '✅ Administrador creado/restaurado con éxito',
            admin: result.rows[0]
        });

    } catch (error: any) {
        console.error("❌ ERROR:", error);
        return res.status(500).json({ 
            message: 'Ocurrió un error al crear el admin', 
            error_detalle: error.message 
        });
    }
}