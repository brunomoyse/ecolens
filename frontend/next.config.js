/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	env: {
		API_DJANGO_ENDPOINT: process.env.NEXT_PUBLIC_BACKEND_ENDPOINT,
	},
};

module.exports = nextConfig;
