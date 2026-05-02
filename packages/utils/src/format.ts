/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR', 'INR')
 * @returns Formatted currency string
 */
export const formatAmount = (amountPaise: number, currency: string | null) => {
	const symbol = currency === 'INR' ? '₹' : currency || '₹'
	return `${symbol}${(amountPaise / 100).toLocaleString()}`
}

export const formatDate = (dateString: string | null | undefined) => {
	if (!dateString) return 'N/A'
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

export const formatDateTime = (dateString: string | null | undefined) => {
	if (!dateString) return 'N/A'
	const date = new Date(dateString)
	return date.toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}
