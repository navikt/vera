/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    typescript: {
        tsconfigPath: './tsconfig.build.json'
    }
}

module.exports = nextConfig
