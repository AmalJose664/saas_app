import type { Metadata } from "next";
import '@repo/tailwind-config/globals.css'

import { Inter } from 'next/font/google';
export const metadata: Metadata = {
	title: "Saas App Admin",
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
				{children}
			</body>
		</html>
	);
}
