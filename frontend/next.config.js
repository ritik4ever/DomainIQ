/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            }
        }

        // Ignore pino-pretty import warnings
        config.ignoreWarnings = [
            {
                module: /node_modules\/pino/,
                message: /Can't resolve 'pino-pretty'/,
            },
        ]

        return config
    },
    images: {
        domains: ['localhost'],
    },
    async rewrites() {
        return [
            {
                source: '/api/proxy/:path*',
                destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`,
            },
        ]
    },

    experimental: {
        proxyTimeout: 60000, // 60 seconds
    }
}

module.exports = nextConfig