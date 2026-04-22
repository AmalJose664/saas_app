import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
	srcLight: string;
	srcDark: string;
};

import Link from 'next/link'

export default function Home() {
	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
				<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">M</span>
						</div>
						<span className="text-xl font-bold text-gray-900 tracking-tight">MyApp</span>
					</div>
					<div className="flex items-center gap-6">
						<Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
							Sign In
						</Link>
						<Link
							href="/login"
							className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
						>
							Get Started
						</Link>
					</div>
				</div>
			</nav>

			<section className="pt-32 pb-20 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
						The simple way to <span className="text-blue-600 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">manage your subscriptions.</span>
					</h1>
					<p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
						An all-in-one platform to track, manage, and optimize your monthly recurring costs without the headache.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							href="/dashboard"
							className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-blue-200"
						>
							Dashboard
						</Link>
					</div>
				</div>
			</section>
		</div>
	)
}