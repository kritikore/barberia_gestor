import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        // ... (Tu código GET existente) ...
        try {
            const perfilRes = await db.query('SELECT * FROM barber WHERE id_bar = $1', [id]);
            if (perfilRes.rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
            
            const b = perfilRes.rows[0];
            const insumosCalculados = [
                { nombre: 'Navajas', actual: b.st_navajas, max: 200, pct: (b.st_navajas / 200) * 100 },
                { nombre: 'Papel Cuello', actual: b.st_papel, max: 500, pct: (b.st_papel / 500) * 100 },
                { nombre: 'Talco', actual: b.st_talco, max: 180, pct: (b.st_talco / 180) * 100 },
                { nombre: 'After Shave', actual: b.st_aftershave, max: 180, pct: (b.st_aftershave / 180) * 100 },
                { nombre: 'Desinfectante', actual: b.st_desinfectante, max: 500, pct: (b.st_desinfectante / 500) * 100 },
            ];
            const citasRes = await db.query(`
                SELECT c.fecha, c.hora, s.tipo as detalle, s.precio as monto, 'Cita' as tipo_movimiento
                FROM cita c JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.id_bar = $1 AND c.estado = 'Completada'
            `, [id]);
            const historial = [...citasRes.rows].sort((x, y) => new Date(y.fecha).getTime() - new Date(x.fecha).getTime());
            return res.status(200).json({ perfil: b, insumos: insumosCalculados, historial });
        } catch (error) { return res.status(500).json({ message: 'Error server' }); }
    }

    else if (req.method === 'PUT') {
        // ... (Tu código PUT existente) ...
        if (req.body && !req.body.nom_bar && !req.body.email) {
             try {
                await db.query(`
                    UPDATE barber SET st_navajas = 200, st_papel = 500, st_talco = 180, st_aftershave = 180, st_desinfectante = 500
                    WHERE id_bar = $1
                `, [id]);
                return res.status(200).json({ message: '✅ Stock reabastecido' });
            } catch (error) { return res.status(500).json({ message: 'Error re-stock' }); }
        } else {
            const { nom_bar, apell_bar, email, password } = req.body;
            try {
                let query = "UPDATE barber SET nom_bar=$1, apell_bar=$2, email=$3 WHERE id_bar=$4";
                let values = [nom_bar, apell_bar, email, id];
                if (password && password.trim() !== '') {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(password, salt);
                    query = "UPDATE barber SET nom_bar=$1, apell_bar=$2, email=$3, password=$4 WHERE id_bar=$5";
                    values = [nom_bar, apell_bar, email, hash, id];
                }
                await db.query(query, values);
                return res.status(200).json({ message: 'Datos actualizados' });
            } catch (error) { return res.status(500).json({ message: 'Error al actualizar perfil' }); }
        }
    }

    // --- DELETE CORREGIDO ---
    else if (req.method === 'DELETE') {
        try {
            // 1. Verificar primero si ya estaba borrado para no repetir el prefijo 'del_'
            const check = await db.query("SELECT email FROM barber WHERE id_bar = $1", [id]);
            if (check.rows.length > 0 && check.rows[0].email.startsWith('del_')) {
                return res.status(200).json({ message: 'Este usuario ya estaba eliminado.' });
            }

            // 2. Intentar borrado físico
            await db.query("DELETE FROM barber WHERE id_bar = $1", [id]);
            return res.status(200).json({ message: 'Barbero eliminado (Sin historial)' });

        } catch (error: any) {
            // 3. Si falla por FK (Historial), archivar
            if (error.code === '23503') {
                try {
                    await db.query(`
                        UPDATE barber 
                        SET estado = 'Inactivo', 
                            email = CONCAT('del_', id_bar::text, '_', email), 
                            password = 'DELETED' 
                        WHERE id_bar = $1
                    `, [id]);
                    return res.status(200).json({ message: 'Barbero archivado correctamente.' });
                } catch (updateError: any) {
                    console.error("Error archivando:", updateError);
                    return res.status(500).json({ message: 'Error al archivar' });
                }
            }
            console.error(error);
            return res.status(500).json({ message: 'Error interno' });
        }
    }
}