

"use client"

interface ModalProps {
	isOpen: boolean;
	title: string;
	subtext: string;
	cancelText?: string;
	confirmText?: string;
	onCancel: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
	variant?: 'danger' | 'primary';
}

export default function ConfirmationModal({
	isOpen,
	title,
	subtext,
	cancelText = "Cancel",
	confirmText = "Confirm",
	onCancel,
	onConfirm,
	isLoading = false,
	variant = 'primary'
}: ModalProps) {
	if (!isOpen) return null;

	const confirmButtonStyles = variant === 'danger'
		? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
		: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div
				className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-left"
				onClick={(e) => e.stopPropagation()}
			>
				<div>
					<h3 className="text-lg font-bold text-slate-900">{title}</h3>
					<p className="text-slate-500 mt-2 text-sm leading-relaxed">
						{subtext}
					</p>
				</div>

				<div className="flex gap-3 mt-6">
					<button
						disabled={isLoading}
						onClick={onCancel}
						className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
					>
						{cancelText}
					</button>
					<button
						disabled={isLoading}
						onClick={onConfirm}
						className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition ${confirmButtonStyles}`}
					>
						{isLoading ? 'Processing...' : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}