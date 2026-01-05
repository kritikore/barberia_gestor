import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'ID de cliente requerido' });
    }

    // ==========================================
    // 1. OBTENER UN CLIENTE (GET) - Para el detalle
    // ==========================================
    if (req.method === 'GET') {
        try {
            // Buscamos datos del perfil
            const perfilQuery = `
                SELECT c.*, b.nom_bar, b.apell_bar 
                FROM cliente c
                LEFT JOIN barber b ON c.id_bar = b.id_bar
                WHERE c.id_clie = $1
            `;
            const perfilRes = await db.query(perfilQuery, [id]);

            if (perfilRes.rows.length === 0) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }

            // Buscamos historial de citas/servicios
            // Buscamos historial de citas/servicios
            // Buscamos historial de citas/servicios
            const historialQuery = `
                SELECT 
                    c.fecha, 
                    s.tipo as servicio, 
                    b.nom_bar, 
                    -- CORRECCIÓN: Usamos s.precio (Precio del Servicio) porque c.precio no existe
                    COALESCE(s.precio, 0) as total
                FROM cita c
                LEFT JOIN servicio s ON c.id_serv = s.id_serv
                LEFT JOIN barber b ON c.id_bar = b.id_bar
                WHERE c.id_clie = $1
                ORDER BY c.fecha DESC
                LIMIT 10
            `;
            const historialRes = await db.query(historialQuery, [id]);

            return res.status(200).json({
                perfil: perfilRes.rows[0],
                historial: historialRes.rows
            });

        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'Error al obtener cliente' });
        }
    }

    // ==========================================
    // 2. ACTUALIZAR CLIENTE (PUT) - AQUÍ ESTABA EL PROBLEMA
    // ==========================================
    if (req.method === 'PUT') {
        try {
            const { 
                nom_clie, apell_clie, tel_clie, email_clie, 
                ocupacion, edad_clie, id_bar, foto 
            } = req.body;

            // PREPARACIÓN DE LA FOTO
            let fotoBuffer: Buffer | null = null;
            let hayNuevaFoto = false;

            // Solo procesamos si viene un string Base64 válido (que indica cambio)
            if (foto && typeof foto === 'string' && foto.startsWith('data:image')) {
                const matches = foto.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    fotoBuffer = Buffer.from(matches[2], 'base64');
                    hayNuevaFoto = true;
                }
            }

            // CASO A: SI HAY FOTO NUEVA -> Actualizamos TODO
            if (hayNuevaFoto) {
                await db.query(`
                    UPDATE cliente SET
                        nom_clie = $1,
                        apell_clie = $2,
                        tel_clie = $3,
                        email_clie = $4,
                        ocupacion = $5,
                        edad_clie = $6,
                        id_bar = $7,
                        foto = $8  -- 👈 Aquí actualizamos la foto
                    WHERE id_clie = $9
                `, [
                    nom_clie, apell_clie, tel_clie, email_clie, 
                    ocupacion, parseInt(edad_clie), id_bar ? parseInt(id_bar) : null, 
                    fotoBuffer, // Binario nuevo
                    id
                ]);
            } 
            // CASO B: NO HAY FOTO NUEVA -> Actualizamos SOLO TEXTO (Respetamos foto vieja)
            else {
                await db.query(`
                    UPDATE cliente SET
                        nom_clie = $1,
                        apell_clie = $2,
                        tel_clie = $3,
                        email_clie = $4,
                        ocupacion = $5,
                        edad_clie = $6,
                        id_bar = $7
                        -- 🚫 NO TOCAMOS LA COLUMNA FOTO
                    WHERE id_clie = $8
                `, [
                    nom_clie, apell_clie, tel_clie, email_clie, 
                    ocupacion, parseInt(edad_clie), id_bar ? parseInt(id_bar) : null,
                    id
                ]);
            }

            return res.status(200).json({ message: 'Cliente actualizado correctamente' });

        } catch (error: any) {
            console.error("Error al actualizar:", error);
            return res.status(500).json({ message: 'Error interno al actualizar' });
        }
    }

    // ==========================================
    // 3. ELIMINAR CLIENTE (DELETE)
    // ==========================================
    if (req.method === 'DELETE') {
        try {
            // Opcional: Borrar citas primero si tienes Foreign Keys estrictas
            await db.query('DELETE FROM cita WHERE id_clie = $1', [id]);
            await db.query('DELETE FROM cliente WHERE id_clie = $1', [id]);
            
            return res.status(200).json({ message: 'Cliente eliminado' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al eliminar cliente' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}