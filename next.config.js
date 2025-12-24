/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Always use basePath for GitHub Pages (repository name)
  // Update this to match your actual repository name on GitHub
  basePath: process.env.GITHUB_PAGES === 'true' || process.env.NODE_ENV === 'production' ? '/Anchored' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig

