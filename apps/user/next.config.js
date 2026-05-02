/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["@workspace/ui", "@workspace/database", "@workspace/validation"],
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: '**.supabase.co' },
			{ protocol: 'https', hostname: 'lh3.googleusercontent.com' },
		],
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
				],
			},
		];
	},
};

export default nextConfig;