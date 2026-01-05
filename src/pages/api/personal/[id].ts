import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) return res.status(400).json({ message: 'ID requerido' });

    // ==========================================
    // 1. OBTENER DATOS (GET)
    // ==========================================
    if (req.method === 'GET') {
        try {
            // A) PERFIL
            const resultBarber = await db.query(`SELECT * FROM barber WHERE id_bar = $1`, [id]);
            if (resultBarber.rows.length === 0) return res.status(404).json({ message: 'Barbero no encontrado' });
            const barbero = resultBarber.rows[0];

            // B) HISTORIAL DE CORTES (CITAS)
            // Traemos fecha, hora, nombre del cliente y servicio exacto
            const queryCitas = `
                SELECT 
                    c.fecha, 
                    c.hora, 
                    s.tipo as servicio, 
                    CONCAT(cl.nom_clie, ' ', cl.apell_clie) as cliente,
                    s.precio,
                    c.estado,
                    'Cita' as tipo_movimiento
                FROM cita c
                LEFT JOIN servicio s ON c.id_serv = s.id_serv
                LEFT JOIN cliente cl ON c.id_clie = cl.id_clie
                WHERE c.id_bar = $1
                ORDER BY c.fecha DESC, c.hora DESC
                LIMIT 100
            `;
            const resultCitas = await db.query(queryCitas, [id]);

            // C) HISTORIAL DE VENTAS (Con protección por si falla la columna fecha)
            let ventas = [];
            try {
                const queryVentas = `
                    SELECT 
                        v.id_venta,
                        MAKE_DATE(v.ao, v.mes, v.dia) as fecha, -- Usamos MAKE_DATE para arreglar tu error anterior
                        '00:00' as hora,
                        'Venta Producto' as servicio, 
                        'Cliente Mostrador' as cliente, 
                        v.total as precio,
                        'Pagado' as estado,
                        'Venta' as tipo_movimiento
                    FROM venta v
                    WHERE v.id_bar = $1
                    ORDER BY v.ao DESC, v.mes DESC, v.dia DESC
                    LIMIT 50
                `;
                const resultVentas = await db.query(queryVentas, [id]);
                ventas = resultVentas.rows;
            } catch (e) {
                console.warn("No se pudieron cargar las ventas:", e);
            }

            // D) ESTADÍSTICAS (TOTALES)
            const stats = await db.query(`
                SELECT COUNT(*) as total_cortes, COALESCE(SUM(s.precio), 0) as dinero_cortes
                FROM cita c
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.id_bar = $1 AND (c.estado = 'Completada' OR c.estado = 'Pagado')
            `, [id]);

            // E) INSUMOS (Stock actual)
            const configInsumos = [
                { key: 'st_navajas', nombre: 'Navajas', max: 100 },
                { key: 'st_papel', nombre: 'Papel', max: 10 },
                { key: 'st_talco', nombre: 'Talco', max: 2 },
                { key: 'st_aftershave', nombre: 'Aftershave', max: 2 },
                { key: 'st_desinfectante', nombre: 'Desinfectante', max: 2 }
            ];
            const listaInsumos = configInsumos.map(item => ({
                key: item.key, nombre: item.nombre, actual: barbero[item.key] || 0,
                max: item.max, pct: Math.min(((barbero[item.key]||0)/item.max)*100, 100)
            }));

            // UNIMOS TODO EN UN SOLO HISTORIAL CRONOLÓGICO
            const historialCompleto = [...resultCitas.rows, ...ventas].sort((a, b) => {
                return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
            });

            return res.status(200).json({
                perfil: barbero,
                insumos: listaInsumos,
                historial: historialCompleto, // <-- AQUÍ VA LA LISTA INDIVIDUAL DE CORTES
                estadisticas: {
                    totalCortes: stats.rows[0].total_cortes,
                    totalGenerado: stats.rows[0].dinero_cortes
                }
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error obteniendo datos' });
        }
    }

    // ==========================================
    // 2. PUT (RESTOCK + EDICIÓN)
    // ==========================================
    if (req.method === 'PUT') {
        const { action, item, nom_bar, apell_bar, tel_bar, email, pass_bar, estado } = req.body;

        // RESTOCK (Rellenar insumos desde el botón del admin)
        if (action === 'restock' && item) {
            const maxStocks: any = { st_navajas: 100, st_papel: 10, st_talco: 2, st_aftershave: 2, st_desinfectante: 2 };
            if (!maxStocks[item]) return res.status(400).json({ message: 'Item inválido' });
            
            await db.query(`UPDATE barber SET ${item} = $1 WHERE id_bar = $2`, [maxStocks[item], id]);
            return res.status(200).json({ message: 'Stock actualizado' });
        }

        // EDICIÓN NORMAL
        let q = `UPDATE barber SET nom_bar=$1, apell_bar=$2, tel_bar=$3, email=$4, estado=$5 WHERE id_bar=$6`;
        let v = [nom_bar, apell_bar, tel_bar, email, estado, id];

        if (pass_bar) {
            q = `UPDATE barber SET nom_bar=$1, apell_bar=$2, tel_bar=$3, email=$4, pass_bar=$5, estado=$6 WHERE id_bar=$7`;
            v = [nom_bar, apell_bar, tel_bar, email, pass_bar, estado, id];
        }

        try {
            await db.query(q, v);
            return res.status(200).json({ message: 'Perfil actualizado' });
        } catch (e: any) {
            return res.status(500).json({ message: e.code === '23505' ? 'Email duplicado' : 'Error interno' });
        }
    }

    // ==========================================
    // 3. DELETE (Baja Lógica para no romper historial)
    // ==========================================
if (req.method === 'DELETE') {
        try {
            // PASO 1: LIBERAR CLIENTES (Importante)
            // Antes de hacer nada, le quitamos los clientes a este barbero
            // para que queden "Sin Asignar" y otro los pueda tomar.
            await db.query('UPDATE cliente SET id_bar = NULL WHERE id_bar = $1', [id]);

            // PASO 2: INTENTAR BORRAR FÍSICAMENTE
            // Ahora que no tiene clientes, intentamos borrar.
            // Si tiene CITAS o VENTAS, fallará y pasaremos al catch (Baja Lógica).
            await db.query('DELETE FROM barber WHERE id_bar = $1', [id]);
            
            return res.status(200).json({ message: 'Barbero eliminado permanentemente (No tenía historial)' });

        } catch (error: any) {
            // Código 23503: Violación de llave foránea (Tiene CITAS o VENTAS asociadas)
            if (error.code === '23503') {
                console.log("El barbero tiene historial, procediendo a BAJA LÓGICA...");
                
                // En lugar de borrar, lo ponemos como INACTIVO/BAJA
                await db.query(`UPDATE barber SET estado = 'Baja' WHERE id_bar = $1`, [id]);
                
                return res.status(200).json({ 
                    message: 'Barbero dado de BAJA. Sus clientes han sido liberados, pero su historial de ventas se conserva.' 
                });
            }
            
            console.error(error);
            return res.status(500).json({ message: 'Error al eliminar barbero' });
        }
    }}