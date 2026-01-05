import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'ID de servicio no proporcionado' });
    }

    // --- 1. ELIMINAR SERVICIO (DELETE) ---
    if (req.method === 'DELETE') {
        try {
            // Se usa el nombre de tabla corregido: "servicio"
            const result = await db.query('DELETE FROM servicio WHERE id_serv = $1 RETURNING *', [id]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Servicio no encontrado' });
            }
            
            return res.status(200).json({ message: 'Servicio eliminado' });
        
        } catch (error: any) {
            console.error("Error al eliminar servicio:", error);
            // Si el error es de llave foránea (23503), es porque el servicio ya se usó en un ticket
            if (error.code === '23503') { 
                 return res.status(409).json({ message: 'No se puede eliminar: este servicio ya está registrado en ventas.' });
            }
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    // --- 2. EDITAR SERVICIO (PUT) ---
    if (req.method === 'PUT') {
        try {
            const { tipo, precio, descripcion } = req.body;

            if (!tipo || precio === undefined) {
                return res.status(400).json({ message: 'El nombre y el precio son obligatorios.' });
            }
            
            const query = `
                UPDATE servicio
                SET tipo = $1,
                    precio = $2,
                    descripcion = $3
                WHERE id_serv = $4
                RETURNING *;
            `;
            const values = [tipo, parseFloat(precio), descripcion || '', id];
            
            const result = await db.query(query, values);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Servicio no encontrado' });
            }

            return res.status(200).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error al editar servicio:", error);
            return res.status(500).json({ message: 'Error al actualizar la base de datos' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}