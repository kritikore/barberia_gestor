import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import multiparty from 'multiparty';
import fs from 'fs';

export const config = {
    api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // ✅ 1. MÉTODO GET: Listar Clientes (Esto es lo que faltaba)
    if (req.method === 'GET') {
        try {
            // Traemos todos los clientes. 
            // El filtrado por barbero lo haces en el frontend (como vi en tu error)
            const query = `
                SELECT c.*, b.nom_bar, b.apell_bar
                FROM cliente c
                LEFT JOIN barber b ON c.id_bar = b.id_bar
                ORDER BY c.id_clie DESC
            `;
            const result = await db.query(query);
            
            console.log("🔍 DATOS QUE SALEN DE LA BD:", JSON.stringify(result.rows, null, 2));
            // Devolvemos un ARRAY. Ahora data.filter() sí funcionará.
            return res.status(200).json(result.rows);

        } catch (error: any) {
            console.error("Error al listar clientes:", error);
            return res.status(500).json({ message: 'Error al obtener clientes' });
        }
    }

    // ✅ 2. MÉTODO POST: Crear Cliente (Lo que ya tenías funcionando)
    if (req.method === 'POST') {
        
        await new Promise<void>((resolve, reject) => {
            const form = new multiparty.Form();

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error("❌ Error al leer formulario:", err);
                    res.status(500).json({ message: 'Error leyendo datos' });
                    return resolve();
                }

                try {
                    // Limpieza de datos
                    const nom_clie = fields.nom_clie?.[0]?.trim();
                    const apell_clie = fields.apell_clie?.[0]?.trim();
                    const tel_clie = fields.tel_clie?.[0]?.trim();
                    const email_clie = fields.email_clie?.[0]?.trim() || '';
                    const ocupacion = fields.ocupacion?.[0]?.trim() || 'No especificada';
                    const edad_clie = fields.edad_clie?.[0] ? parseInt(fields.edad_clie[0]) : 0;
                    
                    let id_bar = null;
                    if (fields.id_bar && fields.id_bar[0] && fields.id_bar[0] !== '0' && fields.id_bar[0] !== '') {
                        id_bar = parseInt(fields.id_bar[0]);
                    }

                    if (!nom_clie || !apell_clie || !tel_clie) {
                        res.status(400).json({ message: 'Faltan datos obligatorios' });
                        return resolve();
                    }

                    // Foto
                    let fotoBuffer = null;
                    if (files.foto && files.foto.length > 0) {
                        const filePath = files.foto[0].path;
                        fotoBuffer = fs.readFileSync(filePath);
                        fs.unlinkSync(filePath); 
                    }

                    // Query Insertar
                    const query = `
                        INSERT INTO cliente (
                            nom_clie, apell_clie, tel_clie, email_clie, 
                            ocupacion, edad_clie, id_bar, foto
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING id_clie;
                    `;

                    const values = [nom_clie, apell_clie, tel_clie, email_clie, ocupacion, edad_clie, id_bar, fotoBuffer];

                    await db.query(query, values);
                    
                    res.status(201).json({ message: 'Cliente creado exitosamente' });
                    return resolve();

                } catch (error: any) {
                    console.error("❌ ERROR BD:", error);
                    res.status(500).json({ message: 'Error de Base de Datos', detail: error.message });
                    return resolve();
                }

            });
        });


        
    } else {
        // Cualquier otro método que no sea GET ni POST
        res.status(405).json({ message: 'Método no permitido' });
    }
}