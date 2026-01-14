/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce console noise
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Suppress unnecessary warnings
  reactStrictMode: true,
  // React Compiler: automatically optimizes component rendering
  reactCompiler: true,
}

export default nextConfig
