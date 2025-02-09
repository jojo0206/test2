/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// export default nextConfig;
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    // removeConsole: {
    //   exclude: ['error']
    // }
  },
};

export default withBundleAnalyzer(nextConfig);
