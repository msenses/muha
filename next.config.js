/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    typedRoutes: true
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ];
  }
};

module.exports = nextConfig;

