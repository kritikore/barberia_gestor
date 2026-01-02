import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Importamos tu conexión configurada

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // 1. MANEJO DE POST (Crear Cliente)
    if (req.method === 'POST') {
        try {
            // Ahora recibimos JSON directo gracias a tu cambio en el Modal
            const { 
                nom_clie, 
                apell_clie, 
                tel_clie, 
                email_clie, 
                ocupacion, 
                edad_clie, 
                id_bar, 
                foto // Esto viene como string largo: "data:image/png;base64,..."
            } = req.body;

            let fotoBuffer: Buffer | null = null;

            // ⚠️ LÓGICA DE CONVERSIÓN (CRÍTICO)
            // Si viene foto, hay que quitarle el encabezado "data:image/..." y convertirla a Buffer
            if (foto && typeof foto === 'string') {
                // Separamos en la coma: [0] es el header, [1] es la data pura
                const matches = foto.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                
                if (matches && matches.length === 3) {
                    // Creamos el buffer binario que Postgres (bytea) necesita
                    fotoBuffer = Buffer.from(matches[2], 'base64');
                }
            }

            // Validaciones básicas
            if (!nom_clie || !apell_clie || !tel_clie) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }

            // Query SQL para insertar en Supabase
            // Nota: El orden de los $1, $2 debe coincidir con el array de valores
            const query = `
                INSERT INTO cliente 
                (nom_clie, apell_clie, tel_clie, email_clie, ocupacion, edad_clie, id_bar, foto)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id_clie, nom_clie;
            `;

            const values = [
                nom_clie,
                apell_clie,
                tel_clie,
                email_clie || null,
                ocupacion || null,
                edad_clie ? parseInt(edad_clie) : null,
                id_bar ? parseInt(id_bar) : null,
                fotoBuffer // Aquí pasamos el binario, no el string
            ];

            const result = await db.query(query, values);

            return res.status(200).json({ 
                message: 'Cliente creado exitosamente', 
                cliente: result.rows[0] 
            });

        } catch (error: any) {
            console.error('❌ Error al crear cliente:', error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // 2. MANEJO DE GET (Listar Clientes - Opcional si ya lo tenías)
   else if (req.method === 'GET') {
        try {
            // CORRECCIÓN: Usamos LEFT JOIN para traer nombre y apellido del barbero
            const query = `
                SELECT 
                    c.*,
                    b.nom_bar,
                    b.apell_bar
                FROM cliente c
                LEFT JOIN barber b ON c.id_bar = b.id_bar
                ORDER BY c.id_clie DESC
            `;
            const result = await db.query(query);
            return res.status(200).json(result.rows);
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener clientes' });
        }
    }}