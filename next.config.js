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
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'lagunoapp.xyz' }],
        destination: 'https://www.lagunoapp.xyz/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
