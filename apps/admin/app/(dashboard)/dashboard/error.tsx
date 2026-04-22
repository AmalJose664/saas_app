'use client';

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="p-6 border-2 border-red-500 rounded-lg bg-red-50">
			<h2 className="text-xl font-bold text-red-700">Something went wrong!</h2>
			<p className="text-red-600 mb-4">{error.message}</p>
			<button
				onClick={() => reset()}
				className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
			>
				Try again
			</button>
		</div>
	);
}