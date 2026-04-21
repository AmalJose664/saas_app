"use client";
import { useState } from "react";
import { createClient } from '@myapp/supabase'

const Page = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const supabase = createClient()

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setMessage(error.message);
		} else {
			setMessage("Success! Redirecting...");
			window.location.href = "/dashboard";
		}
		setLoading(false);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
			<div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
				<h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
					Welcome Back
				</h1>
				<p className="text-gray-500 text-center mb-8 text-sm">
					Enter your credentials to access your account
				</p>

				<form onSubmit={handleLogin} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<input
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
							required
						/>
					</div>

					{message && (
						<p className={`text-sm text-center ${message.includes("Success") ? "text-green-600" : "text-red-600"}`}>
							{message}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Page;