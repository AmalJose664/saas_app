"use client";

import { ReactNode } from "react";
import { toast } from "sonner";

interface ButtonProps {
	children: ReactNode;
	className?: string;
	appName: string;
}

export const Button = ({ children, className, appName }: ButtonProps) => {
	return (
		<button
			className={className}
			onClick={() => toast.error(`Hello from your ${appName} app!`)}
		>
			{children}
		</button>
	);
};
