// refactor that

import React from "react";
import { Wallet } from '@mercadopago/sdk-react';

interface Props {
    amount?: number;
    providerId?: string;
    payerEmail?: string;
    items?: any[];
    userId?: string;
    onPaymentResult?: (result: any) => void;
}

const CardPaymentBrick: React.FC<Props> = ({
    amount,
    providerId,
    payerEmail,
    items = [],
    userId,
    onPaymentResult
}) => {
    const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const initialization = {
        redirectMode: "self" as const,
    };

    // Customization for Wallet Brick
    const customization = {
        theme: "default" as const,
        valueProp: 'practicality' as const,
    };

    const onSubmit = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = {
                    items: items,
                    payer: { email: payerEmail, first_name: "Test", last_name: "User" }, // Enrich if possible
                    providerId: providerId,
                    userId: userId,
                    // IMPORTANT: The first item ID is the bookingId
                    external_reference: items[0]?.id || "ext_wallet_" + Date.now()
                };

                const resp = await fetch(`${BACKEND_URL}/api/payments/create-preference`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const json = await resp.json();
                console.log("Backend Create Preference Response:", json);

                if (json.success && json.data.preferenceId) {
                    resolve(json.data.preferenceId);
                } else {
                    console.error("Failed to create preference:", json);
                    reject();
                }
            } catch (e) {
                console.error("Error creating preference:", e);
                reject();
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
        <Wallet
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
        />
    );
};

export default CardPaymentBrick;
