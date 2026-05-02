/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
	reactStrictMode: true,
	// Explicitly set the Turbopack workspace root to avoid incorrect inference.
	// Next.js was detecting C:\Personal Projects (wrong) instead of
	// C:\Personal Projects\supporttaservers (correct monorepo root).
	// __dirname is apps/admin, so go two levels up to the monorepo root.
	turbopack: {
		root: path.resolve(process.cwd(), '..', '..'),
	},
	transpilePackages: ["@workspace/ui", "@workspace/database", "@workspace/validations"],
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