/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
    ],
  },
  // O redirect www <-> nao-www e tratado pela Vercel (dominio primario).
  // Nao definir aqui para evitar loop de redirects.
};

module.exports = nextConfig;
