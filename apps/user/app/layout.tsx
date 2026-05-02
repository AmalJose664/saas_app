/**
 * @file app/layout.tsx
 * @description Root layout for the user-facing application.
 *
 * Architecture:
 * RootLayout (Server Component)
 *   ↓ renders
 * QueryProvider (Client Component) — provides TanStack QueryClient to the tree
 *   ↓ wraps
 * {children} — matched page or layout
 * Toaster — global toast notification renderer (sonner)
 *
 * QueryProvider must be a Client Component because it uses React context.
 */
import type { Metadata } from "next";
import '@repo/ui/globals.css'
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner'
import QueryProvider from '../components/QueryProvider'

export const metadata: Metadata = {
	title: "Saas App",
	description: "",
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
