import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!apiKey) {
            // For development, we'll allow it to be missing, but log a warning
            console.warn('STRIPE_SECRET_KEY is not defined. Payments will fail in production.');
        }
        this.stripe = new Stripe(apiKey || 'sk_test_mock', {
            apiVersion: '2023-10-16' as any,
        });
    }

    async createCheckoutSession(orderId: number, amount: number, customerEmail: string) {
        // ... Stripe logic existing
        return this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'sar',
                        product_data: {
                            name: `Order #${orderId}`,
                        },
                        unit_amount: Math.round(amount * 100), // Stripe expects amounts in cents/halalas
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${this.configService.get('FRONTEND_URL')}/checkout/success?orderId=${orderId}`,
            cancel_url: `${this.configService.get('FRONTEND_URL')}/checkout/cancel?orderId=${orderId}`,
            customer_email: customerEmail,
            metadata: {
                orderId: orderId.toString(),
            },
        });
    }

    async createTabbyCheckout(orderId: number, amount: number, customer: any) {
        console.log(`Initiating Tabby Checkout for Order #${orderId} - Amount: ${amount}`);
        // Tabby standard integration pattern:
        // 1. Send session request to Tabby API (requires secret key)
        // 2. Tabby returns a session ID and redirect URL
        // 3. Return the redirect URL to the frontend

        return {
            status: 'success',
            payment_url: `https://checkout.tabby.ai/test-checkout?order_id=${orderId}&amount=${amount}`, // Placeholder for real redirect
            message: 'Tabby checkout initiated'
        };
    }

    async createTamaraCheckout(orderId: number, amount: number, customer: any) {
        console.log(`Initiating Tamara Checkout for Order #${orderId} - Amount: ${amount}`);
        // Tamara standard integration pattern:
        // 1. Create checkout session via Tamara API
        // 2. Receive checkout URL
        // 3. Redirect user

        return {
            status: 'success',
            payment_url: `https://checkout.tamara.co/checkout/test?orderId=${orderId}&total=${amount}`, // Placeholder
            message: 'Tamara checkout initiated'
        };
    }
}
