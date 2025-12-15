// refactor that

import React from "react";
import { Payment } from '@mercadopago/sdk-react';

interface Props {
    amount?: number;
    providerId?: string;
    payerEmail?: string;
    items?: any[];
    onPaymentResult?: (result: any) => void;
}

const CardPaymentBrick: React.FC<Props> = ({
    amount,
    providerId,
    payerEmail,
    items = [],
    onPaymentResult
}) => {
    const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const initialization = {
        amount: amount,
        payer: {
            email: payerEmail,
        },
    };

    const customization = {
        paymentMethods: {
            ticket: "all",
            creditCard: "all",
            debitCard: "all",
            bankTransfer: "all",
            wallet_purchase: "all",
            maxInstallments: 1,
        },
        visual: {
            style: {
                theme: "dark",
            }
        }
    };

    const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
        return new Promise(async (resolve, reject) => {
            console.log("Submitting payment...", formData);

            // Construct payload matching PaymentController.js expectations
            const payload = {
                ...formData,
                providerId: providerId, // Required for Split Payment
                total_amount: formData.transaction_amount,
                description: `Booking Payment - ${items[0]?.title || 'Service'}`,
                external_reference: "ext_ref_" + Date.now(),
                notification_url: `${BACKEND_URL}/api/payments/webhook`,
                payer: {
                    email: formData.payer.email,
                    identification: formData.payer.identification,
                },
                transactions: {
                    payments: [
                        {
                            amount: formData.transaction_amount,
                            payment_method: {
                                id: formData.payment_method_id,
                                type: formData.payment_method_option_id, // Type often comes here or in additionalData
                                token: formData.token,
                                installments: formData.installments,
                            }
                        }
                    ]
                },
                additional_info: {
                    items: items
                }
            };

            try {
                const resp = await fetch(`${BACKEND_URL}/api/payments/create-payment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const json = await resp.json();

                if (!resp.ok || !json.success) {
                    const errorMessage = json.message || "Unknown error from server";
                    console.error("Payment failed:", json);
                    alert(`Payment Error: ${errorMessage}`);
                    return reject(new Error(errorMessage));
                }

                console.log('Payment authorized:', json);

                if (onPaymentResult) {
                    onPaymentResult(json);
                }

                resolve(null);
            } catch (error) {
                console.error("Network/Server Error processing payment:", error);
                alert("Error connecting to payment server.");
                reject(error);
            }
        });
    };

    const onError = async (error: any) => {
        console.error("Brick error caught in onError:", error);
    };

    const onReady = async () => {
        console.log('Brick ready');
    };

    return (
        <Payment
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
        />
    );
};

export default CardPaymentBrick;
