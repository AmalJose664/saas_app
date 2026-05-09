/**
 * @file app/api/subscription/callback/route.ts
 * @description Handles Razorpay subscription callback after payment completion.
 * Razorpay sends a POST request with form-encoded body containing payment details.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@workspace/supabase/server'
import { getSubscriptionByRazorpayId } from '@/lib/subscriptions/service'
import crypto from "crypto"


export async function POST(request: NextRequest) {
	const redirectWithSession = (url: URL) => {
		const response = NextResponse.redirect(url)
		response.cookies.set('payment_session', 'valid', { maxAge: 300, path: '/' })
		return response
	}

	try {
		const formData = await request.formData();

		const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
		const razorpay_subscription_id = formData.get('razorpay_subscription_id') as string;
		const razorpay_signature = formData.get('razorpay_signature') as string;

		// 2. Verify signature
		const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
		hmac.update(`${razorpay_payment_id}|${razorpay_subscription_id}`);
		const generatedSignature = hmac.digest('hex');

		if (generatedSignature !== razorpay_signature) {
			// Invalid signature - redirect to failure page
			return redirectWithSession(new URL('/payment/failure?reason=Invalid_Signature', request.url));
		}

		// Get the authenticated user
		const supabase = await createClient()
		const { data: { user }, error: authError } = await supabase.auth.getUser()

		if (authError || !user) {
			return redirectWithSession(
				new URL('/payment/failure?reason=authentication_failed', request.url)
			)
		}

		// Verify the subscription exists in our database and belongs to this user
		const subscriptionResult = await getSubscriptionByRazorpayId(razorpay_subscription_id)

		if (!subscriptionResult.success || !subscriptionResult.data || subscriptionResult.data.user_id !== user.id) {
			return redirectWithSession(
				new URL('/payment/failure?reason=subscription_not_found', request.url)
			)
		}

		const subscription = subscriptionResult.data

		// Redirect to success page
		const successUrl = new URL('/payment/success', request.url)
		successUrl.searchParams.set('subscription_id', subscription.id)
		successUrl.searchParams.set('payment_id', razorpay_payment_id)

		return redirectWithSession(successUrl)
	} catch (error) {
		console.error('Subscription callback error:', error)
		return redirectWithSession(
			new URL('/payment/failure?reason=server_error', request.url)
		)
	}
}
