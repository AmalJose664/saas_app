/**
 * @file components/MobileNav.tsx
 * @description Mobile navigation component for the user dashboard.
 * Provides a responsive sidebar with a toggle button and off-canvas menu.
 */
"use client"

import { useState } from "react"
import DashboardSidebar from "./DashboardSidebar"

export default function MobileNav() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white text-gray-800 rounded-lg shadow-sm border border-gray-200"
				aria-label="Toggle menu"
			>
				{isOpen ? (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				) : (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				)}
			</button>

			{/* Mobile Sidebar Overlay */}
			{isOpen && (
				<div
					className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Mobile Sidebar */}
			<aside
				className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
					}`}
			>
				<div className="px-6 py-6 border-b border-gray-100">
					<span className="text-xl font-bold text-blue-600 tracking-tight">SaaS App</span>
				</div>
				<div className="p-4 flex-grow overflow-y-auto" onClick={() => setIsOpen(false)}>
					<DashboardSidebar />
				</div>
			</aside>
		</>
	)
}
