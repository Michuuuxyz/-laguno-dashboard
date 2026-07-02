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
        source: '/((?!api/).*)',
        has: [{ type: 'host', value: 'www.lagunoapp.xyz' }],
        destination: 'https://lagunoapp.xyz/$1',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
