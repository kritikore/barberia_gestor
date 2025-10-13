// src/pages/api/auth/login.ts

import { NextApiRequest, NextApiResponse } from 'next';

// Este es el endpoint que el frontend llama con la URL /api/auth/login
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Tarea de Yovany: Asegurarse de que el método sea POST
  if (req.method !== 'POST') {
    // 405 Method Not Allowed
    return res.status(405).json({ message: 'Método no permitido. Solo se acepta POST.' });
  }

  const { email, password } = req.body;

  // ----------------------------------------------------
  // TAREA FUTURA DE YOVANY: CONEXIÓN REAL A LA BASE DE DATOS
  // (Actualmente, es una simulación)
  // ----------------------------------------------------

  // Simulamos la autenticación para dos roles:
  if (email === 'admin@barberia.com' && password === 'adminpass') {
    // Autenticación exitosa del Administrador
    return res.status(200).json({ 
      success: true, 
      message: 'Bienvenido, Administrador.',
      user: { 
        role: 'admin', 
        name: 'Julio Orozco', // O el nombre del Administrador
        email: email 
      }, 
      token: 'admin-jwt-token-generado' // Un token JWT real debe ser devuelto
    });

  } else if (email === 'barbero1@barberia.com' && password === 'barberopass') {
    // Autenticación exitosa del Barbero/Trabajador
    return res.status(200).json({ 
      success: true, 
      message: 'Bienvenido, Barbero.',
      user: { 
        role: 'barbero', 
        name: 'Edgar Ronquillo', // O el nombre del Barbero
        email: email 
      }, 
      token: 'barbero-jwt-token-generado'
    });
    
  } else {
    // 401 Unauthorized
    return res.status(401).json({ 
      success: false, 
      message: 'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.' 
    });
  }
}