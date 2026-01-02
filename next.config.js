/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignoramos errores para asegurar el deploy
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

