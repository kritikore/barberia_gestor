import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // --- GET: Listar Barberos ---
    if (req.method === 'GET') {
        try {
            const result = await db.query(`
                SELECT * FROM barber 
                WHERE email NOT LIKE 'del_%' 
                ORDER BY id_bar DESC
            `);
            return res.status(200).json(result.rows);
        } catch (error) {
            console.error("Error al listar:", error);
            return res.status(500).json({ message: 'Error al listar personal' });
        }
    }

    // --- POST: Crear Nuevo Barbero ---
    if (req.method === 'POST') {
        console.log("📝 Intentando crear barbero:", req.body);

        const { nom_bar, apell_bar, email, password } = req.body;

        if (!nom_bar || !email || !password) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }

        try {
            // 1. Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 2. Insertar
            // ⚠️ CORRECCIÓN: Agregamos 'tel_bar' y 'edad_bar' con datos por defecto
            // para que la base de datos no rechace el registro.
            const query = `
                INSERT INTO barber (
                    nom_bar, apell_bar, email, password, 
                    posicion, estado, 
                    tel_bar, edad_bar, -- Campos obligatorios agregados
                    st_navajas, st_papel, st_talco, st_aftershave, st_desinfectante
                )
                VALUES (
                    $1, $2, $3, $4, 
                    'Barbero', 'Activo', 
                    '0000000000', 25, -- Teléfono dummy y Edad por defecto (25 años)
                    200, 500, 180, 180, 500
                )
                RETURNING id_bar;
            `;
            
            await db.query(query, [nom_bar, apell_bar || '', email, hashedPassword]);
            
            console.log("✅ Barbero creado con éxito");
            return res.status(201).json({ message: 'Barbero creado exitosamente' });

        } catch (error: any) {
            console.error("❌ ERROR AL CREAR BARBERO:", error); 
            
            if (error.code === '23505') {
                return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
            }
            if (error.code === '42703') {
                return res.status(500).json({ message: 'Faltan columnas de insumos en la BD. Ejecuta el SQL de actualización.' });
            }

            return res.status(500).json({ message: 'Error interno al crear barbero', detail: error.message });
        }
    }
}