import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { period } = req.query; // 'day' o 'month'

    try {
        let serviciosQuery = "";
        let topBarberQuery = "";
        let listaCitasQuery = "";
        
        // --- 1. DEFINIR FILTROS DE TIEMPO ---
        // Filtro para tabla 'venta_producto' (tiene campo timestamp 'fecha')
        let timeFilterVentas = "DATE(vp.fecha) = CURRENT_DATE"; 
        
        // Filtro para tabla 'cita' (tiene campo date 'fecha')
        let timeFilterCitas = "c.fecha = CURRENT_DATE";

        if (period === 'month') {
            timeFilterVentas = "EXTRACT(MONTH FROM vp.fecha) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM vp.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)";
            timeFilterCitas = "EXTRACT(MONTH FROM c.fecha) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM c.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)";
        }

        // --- 2. OBTENER DETALLE DE VENTAS DE PRODUCTOS (Nueva Tabla) ---
        const queryVentas = `
            SELECT 
                vp.fecha,
                p.nom_prod as producto,
                vp.cantidad,
                vp.total,
                b.nom_bar as vendedor
            FROM venta_producto vp
            JOIN PRODUCTO p ON vp.id_prod = p.id_prod
            LEFT JOIN barber b ON vp.id_bar = b.id_bar
            WHERE ${timeFilterVentas}
            ORDER BY vp.fecha DESC
        `;
        
        const ventasRes = await db.query(queryVentas);
        
        // Calcular total monetario de productos
        const totalProductos = ventasRes.rows.reduce((sum: number, item: any) => sum + Number(item.total), 0);

        // Formatear lista para el Dashboard y PDF
        const ventasDetalle = ventasRes.rows.map((v: any) => ({
            hora: new Date(v.fecha).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
            producto: v.producto,
            cantidad: v.cantidad,
            total: v.total,
            vendedor: v.vendedor || 'Admin'
        }));


        // --- 3. OBTENER DETALLE DE SERVICIOS / CORTES (Para el PDF) ---
        // Solo traemos las citas que ya están "Completada"
        const queryServiciosDetalle = `
            SELECT 
                c.fecha, 
                c.hora, 
                b.nom_bar, 
                cl.nom_clie || ' ' || cl.apell_clie as cliente,
                s.tipo as servicio,
                s.precio
            FROM cita c
            JOIN barber b ON c.id_bar = b.id_bar
            JOIN cliente cl ON c.id_clie = cl.id_clie
            JOIN servicio s ON c.id_serv = s.id_serv
            WHERE ${timeFilterCitas} 
            AND c.estado = 'Completada'
            ORDER BY c.fecha DESC, c.hora DESC
        `;
        
        const serviciosDetalleRes = await db.query(queryServiciosDetalle);

        const serviciosDetalle = serviciosDetalleRes.rows.map((s: any) => ({
            fecha: new Date(s.fecha).toLocaleDateString('es-ES'),
            hora: s.hora,
            barbero: s.nom_bar,
            cliente: s.cliente,
            servicio: s.servicio,
            precio: s.precio
        }));


        // --- 4. PREPARAR CONSULTAS DE AGREGADOS (Totales y KPIs) ---

        if (period === 'day') {
            // TOTAL INGRESOS SERVICIOS (Día)
            serviciosQuery = `
                SELECT COALESCE(SUM(s.precio), 0) as total 
                FROM cita c
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.fecha = CURRENT_DATE AND c.estado = 'Completada'
            `;

            // TOP BARBERO (Día)
            topBarberQuery = `
                SELECT b.nom_bar, SUM(s.precio) as total
                FROM cita c
                JOIN barber b ON c.id_bar = b.id_bar
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.fecha = CURRENT_DATE AND c.estado = 'Completada'
                GROUP BY b.nom_bar ORDER BY total DESC LIMIT 1
            `;

            // LISTA DE PRÓXIMAS CITAS (Día - Muestra todas las de hoy)
            listaCitasQuery = `
                SELECT 
                    c.hora, c.estado,
                    cl.nom_clie || ' ' || cl.apell_clie as cliente, 
                    s.tipo as servicio
                FROM cita c
                JOIN cliente cl ON c.id_clie = cl.id_clie
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.fecha = CURRENT_DATE 
                ORDER BY c.hora ASC
            `;

        } else {
            // TOTAL INGRESOS SERVICIOS (Mes)
            serviciosQuery = `
                SELECT COALESCE(SUM(s.precio), 0) as total 
                FROM cita c
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE ${timeFilterCitas} AND c.estado = 'Completada'
            `;

            // TOP BARBERO (Mes)
            topBarberQuery = `
                SELECT b.nom_bar, SUM(s.precio) as total
                FROM cita c
                JOIN barber b ON c.id_bar = b.id_bar
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE ${timeFilterCitas} AND c.estado = 'Completada'
                GROUP BY b.nom_bar ORDER BY total DESC LIMIT 1
            `;

            // LISTA DE PRÓXIMAS CITAS (Mes - Limitada a 5 futuras)
            listaCitasQuery = `
                SELECT 
                    c.hora, c.estado,
                    cl.nom_clie || ' ' || cl.apell_clie as cliente, 
                    s.tipo as servicio
                FROM cita c
                JOIN cliente cl ON c.id_clie = cl.id_clie
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.fecha >= CURRENT_DATE 
                ORDER BY c.fecha ASC, c.hora ASC LIMIT 5
            `;
        }

        // ALERTAS STOCK BAJO (Revisa tabla PRODUCTO)
        const insumosAlertQuery = `SELECT COUNT(*) as alertas FROM PRODUCTO WHERE stock <= 5`;

        // --- 5. EJECUTAR CONSULTAS PARALELAS ---
        const [servRes, insumoRes, topBarberRes, citasRes] = await Promise.all([
            db.query(serviciosQuery),
            db.query(insumosAlertQuery),
            db.query(topBarberQuery),
            db.query(listaCitasQuery)
        ]);

        // --- 6. RESPUESTA JSON FINAL ---
        res.status(200).json({
            servicios: parseFloat(servRes.rows[0]?.total || 0),
            productos: parseFloat(totalProductos.toString()), // Total calculado de venta_producto
            
            ventasDetalle: ventasDetalle,       // <--- Lista para la tarjeta y PDF (Productos)
            serviciosDetalle: serviciosDetalle, // <--- Lista para el PDF (Cortes)
            
            insumosBajos: parseInt(insumoRes.rows[0]?.alertas || 0),
            topBarber: topBarberRes.rows[0] ? topBarberRes.rows[0].nom_bar : "N/A",
            proximasCitas: citasRes.rows
        });

    } catch (error) {
        console.error("Error en Dashboard Metrics:", error);
        res.status(500).json({ message: 'Error al cargar métricas' });
    }
}