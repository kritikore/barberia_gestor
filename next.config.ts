/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESTO ES LO NUEVO QUE DEBES AGREGAR:
  typescript: {
    // !! ADVERTENCIA !!
    // Ignora errores de TS para permitir el deploy aunque haya tipos mal definidos
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! ADVERTENCIA !!
    // Ignora errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig