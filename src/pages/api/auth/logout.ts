import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Aquí limpiarías cookies de sesión en un futuro
    return res.status(200).json({ message: 'Sesión cerrada' });
}