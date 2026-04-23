/**
 * @file app/layout.tsx
 * @description Root layout for the admin application.
 *
 * Architecture:
 * RootLayout (Server Component)
 *   ↓ renders
 * QueryProvider (Client Component)
 *   ↓ wraps
 * App Router pages + Toaster
 *
 * QueryProvider must be a Client Component because it uses React context
 * internally to provide the TanStack QueryClient to the entire tree.
 */

import type { Metadata } from 'next';
import '@repo/tailwind-config/globals.css';

import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import QueryProvider from '../components/QueryProvider';

export const metadata: Metadata = {
	title: 'Saas App Admin',
	description: 'Internal dashboard for managing the subscription platform',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<QueryProvider>
					{children}
				</QueryProvider>
				<Toaster />
			</body>
		</html>
	);
}
