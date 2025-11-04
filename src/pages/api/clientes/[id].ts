// src/pages/api/clientes/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Importa la conexión

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query; // Obtiene el [id] de la URL (ej. /api/clientes/3)

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        // Consulta 1: Obtener detalles del cliente
        const clientQuery = "SELECT * FROM cliente WHERE id_clie = $1";
        const clientResult = await db.query(clientQuery, [id]);

        if (clientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        const cliente = clientResult.rows[0];

        // Consulta 2: Obtener historial de servicios (JOIN con tablas SERVICIO y BARBER)
        const historyQuery = `
            SELECT 
                sr.FECHA, 
                s.tipo, 
                sr.TOTAL,
                b.nom_bar
            FROM SERVICIO_REALIZADO sr
            JOIN DETALLE_SERVICIO ds ON sr.ID_DESE = ds.ID_DESE
            JOIN SERVICIO s ON ds.ID_SERV = s.ID_SERV
            JOIN barber b ON sr.ID_BAR = b.id_bar
            WHERE sr.ID_CLIE = $1
            ORDER BY sr.FECHA DESC;
        `;
        const historyResult = await db.query(historyQuery, [id]);
        const historial = historyResult.rows;

        // Devuelve ambos resultados
        res.status(200).json({ cliente, historial });

    } catch (error: any) {
        console.error("Error en API al buscar cliente:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}