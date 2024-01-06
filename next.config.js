/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      //接口请求 前缀带上/api-text/
      { source: '/api-text/:path*', destination: `https://openapi.youdao.com/:path*` },
      { source: '/api-openai/:path*', destination: 'https://api.openai.com/:path*' },
      { source: '/api-baidu/:path*', destination: "https://aip.baidubce.com/:path*" }
    ]
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
