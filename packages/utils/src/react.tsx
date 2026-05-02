import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import * as React from 'react'
import type { ReactElement, ReactNode } from 'react'

export const getStatusIcon = (status: string | null): ReactElement => {
	switch (status) {
		case 'paid':
			return <CheckCircle2 className="w-6 h-6 text-green-500" />
		case 'failed':
			return <XCircle className="w-6 h-6 text-red-500" />
		default:
			return <Clock className="w-6 h-6 text-yellow-500" />
	}
}