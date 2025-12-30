// refactor that

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { CreditCard, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getFullUserDetails } from "../../api/AdminApi.js";

const PaymentSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const data = await getFullUserDetails();
                setUserData(data);
            } catch (error) {
                toast.error("Failed to load payment settings");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleConnectMercadoPago = async () => {
        try {
            setConnecting(true);

            // Obtener URL de autorización de Mercado Pago
            const response = await fetch(
                `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/payments/oauth/authorize?providerId=${user.id}`
            );

            if (!response.ok) {
                throw new Error("Error generating AUTH URL");
            }

            const data = await response.json();

            if (!data.success || !data.authUrl) {
                throw new Error(data.message);
            }

            // redirect to MercadoPago for auth
            window.location.href = data.authUrl;
        } catch (err) {
            console.error("Error connecting Mercado Pago:", err);
            toast.error(err.message);
            setConnecting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading payment settings...</p>
                </div>
            </div>
        );
    }

    const isConnected = userData?.extra?.mp_connected || false;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Payment Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage how you receive payments from your services
                </p>
            </div>

            {/* Mercado Pago Connection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Mercado Pago Integration
                    </CardTitle>
                    <CardDescription>
                        Connect your Mercado Pago account to receive payments directly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isConnected ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <h3 className="font-bold text-green-900">Mercado Pago Connected</h3>
                            </div>
                            <p className="text-sm text-green-700 mb-4">
                                Your Mercado Pago account is linked. Payments will be credited automatically to your account.
                            </p>
                            <div className="bg-white rounded-lg p-4 border border-green-200 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-800">User ID:</span>
                                    <span className="font-mono font-semibold">{userData?.extra?.mp_user_id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-800">Connected:</span>
                                    <span className="font-semibold">
                                        {userData?.extra?.mp_connected_at
                                            ? new Date(userData.extra.mp_connected_at).toLocaleDateString()
                                            : "—"}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-green-200">
                                    <p className="text-xs text-green-800">
                                        <strong>Platform commission:</strong> 10% per transaction
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-neutral-300 rounded-xl p-8">
                            <div className="text-center max-w-md mx-auto">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8 text-primary" />
                                </div>

                                <h3 className="text-xl font-bold mb-2">Connect Mercado Pago</h3>
                                <p className="text-muted-foreground mb-6">
                                    To receive payments for your services, you need to link your Mercado Pago account.
                                    It's quick, secure, and free.
                                </p>

                                <Button
                                    onClick={handleConnectMercadoPago}
                                    disabled={connecting}
                                    size="lg"
                                    className="w-full max-w-xs"
                                >
                                    {connecting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Connect Mercado Pago
                                        </>
                                    )}
                                </Button>

                                <div className="mt-8 pt-6 border-t border-neutral-200">
                                    <h4 className="font-semibold text-sm mb-3">How it works</h4>
                                    <div className="space-y-3 text-sm text-muted-foreground text-left">
                                        <div className="flex gap-3">
                                            <span className="text-primary font-bold flex-shrink-0">1.</span>
                                            <span>Authorize the connection with your Mercado Pago account</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="text-primary font-bold flex-shrink-0">2.</span>
                                            <span>Clients pay for your services through the platform</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className="text-primary font-bold flex-shrink-0">3.</span>
                                            <span>Receive money directly in your account (minus 10% commission)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Payment Information
                    </CardTitle>
                    <CardDescription>
                        Understand how payments work on the platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Platform Commission</h4>
                            <p className="text-2xl font-bold text-primary">10%</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Deducted from each transaction
                            </p>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Payment Protection</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                System holds funds until service completion
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Payment Flow</p>
                                <p>
                                    When a client pays for your service, the funds are held in escrow.
                                    Once you complete the service and the client confirms, the payment
                                    is released to your Mercado Pago account automatically.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentSettings;
