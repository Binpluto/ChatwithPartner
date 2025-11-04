/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const repo = 'ChatwithPartner'

const nextConfig = {
  output: 'export',                 // 导出到 out/
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  images: { unoptimized: true },    // 静态导出图片
  // 如有需要可打开：
  // trailingSlash: true,
}

module.exports = nextConfig
