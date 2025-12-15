// src/pages/api/clientes/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // GET: OBTENER PERFIL + HISTORIAL
    if (req.method === 'GET') {
        try {
            // 1. Datos del Cliente
            const clienteRes = await db.query(`
                SELECT *, encode(foto, 'base64') as foto_base64 
                FROM cliente 
                WHERE id_clie = $1
            `, [id]);
            
            if (clienteRes.rows.length === 0) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }

            // 2. Historial de Cortes (CORREGIDO: Usamos la tabla 'cita')
            // Buscamos en 'cita' las que estén Completadas o Confirmadas
            const historialRes = await db.query(`
                SELECT 
                    c.fecha, 
                    s.precio as total, -- Asumimos que el servicio tiene precio
                    s.tipo as servicio, 
                    b.nom_bar 
                FROM cita c
                JOIN servicio s ON c.id_serv = s.id_serv
                LEFT JOIN barber b ON c.id_bar = b.id_bar
                WHERE c.id_clie = $1 
                -- Opcional: Descomenta la siguiente línea si solo quieres ver las completadas
                -- AND c.estado = 'Completada' 
                ORDER BY c.fecha DESC
                LIMIT 10
            `, [id]);

            res.status(200).json({
                perfil: clienteRes.rows[0],
                historial: historialRes.rows
            });
        } catch (error: any) {
            console.error("Error al cargar perfil:", error.message);
            res.status(500).json({ message: 'Error al cargar perfil' });
        }
    }

    // PUT: EDITAR CLIENTE
    if (req.method === 'PUT') {
        const { nom_clie, apell_clie, tel_clie, email_clie, ocupacion, edad_clie, id_bar } = req.body;
        try {
            await db.query(`
                UPDATE cliente 
                SET nom_clie=$1, apell_clie=$2, tel_clie=$3, email_clie=$4, ocupacion=$5, edad_clie=$6, id_bar=$7
                WHERE id_clie=$8
            `, [nom_clie, apell_clie, tel_clie, email_clie, ocupacion, Number(edad_clie), id_bar ? Number(id_bar) : null, id]);
            
            res.status(200).json({ message: 'Perfil actualizado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar' });
        }
    }

    // DELETE: ELIMINAR CLIENTE (CORREGIDO)
   if (req.method === 'DELETE') {
        try {
            // PASO 1: Eliminar historial de servicios antiguos (Donde te daba el error)
            await db.query('DELETE FROM servicio_realizado WHERE id_clie = $1', [id]);

            // PASO 2: Eliminar citas agendadas
            await db.query('DELETE FROM cita WHERE id_clie = $1', [id]);

            // PASO 3: (Opcional) Si tienes ventas asociadas al cliente, descomenta esto:
            // await db.query('DELETE FROM venta WHERE id_clie = $1', [id]);

            // PASO 4: Ahora sí, eliminar al cliente (Ya no tiene ataduras)
            await db.query('DELETE FROM cliente WHERE id_clie = $1', [id]);
            
            res.status(200).json({ message: 'Cliente y todo su historial eliminados' });
        } catch (error: any) {
            console.error("Error al eliminar:", error.message);
            // Si sigue fallando por otra tabla, el mensaje nos dirá cuál es
            res.status(500).json({ message: 'Error al eliminar: ' + error.message });
        }
    }

}