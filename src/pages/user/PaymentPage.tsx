import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { Loader2, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CardPaymentBrick from "../../components/payments/MercadoPagoBrick";
import { calculateFees } from "../../lib/feeCalculator";

const MP_PUBLIC_KEY = import.meta.env.VITE_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [paymentResult, setPaymentResult] = useState<any>(null);
    const [showMPBrick, setShowMPBrick] = useState(false);

    const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        // Initialize Mercado Pago
        if (MP_PUBLIC_KEY) {
            initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
            setIsLoading(false);
        }

        // Fetch Booking Data
        const fetchBooking = async () => {
            try {
                if (!bookingId) return;
                const res = await fetch(`${BACKEND_URL}/api/bookings/getBooking/${bookingId}`);

                if (res.ok) {
                    const data = await res.json();

                    if (data.success) {
                        setBooking(data.data);
                    } else {
                        console.error("Booking fetch unsuccessful:", data.message);
                    }
                } else {
                    console.error("Booking fetch failed status:", res.status);
                }
            } catch (e) {
                console.error("Failed to fetch booking:", e);
            }
        };
        fetchBooking();
    }, [bookingId, navigate]);

    console.log("Render Booking State:", booking);
    const amount = booking ? Number(booking.total_amount || 0) : 0;

    const handlePaymentResult = (result: any) => {
        setPaymentResult(result);
    };

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>

            {paymentResult ? (
                // ... Success Card ...
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-800">Payment Authorized!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-green-700">Thank you for your payment.</p>
                        <div className="bg-white p-4 rounded border border-green-100 font-mono text-sm">
                            <p><strong>Payment ID:</strong> {paymentResult.data?.orderId || paymentResult.id || "N/A"}</p>
                            <p><strong>Escrow Code:</strong> {paymentResult.data?.escrowCode || "N/A"}</p>
                        </div>
                        <Button onClick={() => navigate('/user/bookings')}>
                            Go to Bookings
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
                            <CardDescription>Order #{bookingId}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Service:</span>
                                    <span className="font-medium">{booking?.service_title || "Service Payment"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Price:</span>
                                    <span className="font-medium">${amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">DOLT Fee (2.05%):</span>
                                    <span>${calculateFees(amount).doltFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Marketplace Charge (5%):</span>
                                    <span>${calculateFees(amount).marketplaceCharge.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">Total:</span>
                                    <div className="text-2xl font-bold">${calculateFees(amount).finalAmount.toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t text-sm text-neutral-500">
                                <p>{booking?.service_description || "Includes all taxes and fees."}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Payment Method</CardTitle>
                            <CardDescription>Choose how you want to pay</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {!showMPBrick ? (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full h-auto py-4 justify-start text-left hover:bg-neutral-50 border-2 hover:border-[#009EE3]/50"
                                        onClick={() => setShowMPBrick(true)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#009EE3]/10 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-[#009EE3]" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-base">Mercado Pago</div>
                                                <div className="text-xs text-neutral-500">Cards, Debit, Wallet</div>
                                            </div>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        disabled
                                        className="w-full h-auto py-4 justify-start text-left opacity-60"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#635BFF]/10 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-[#635BFF]" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-base">Stripe</div>
                                                <div className="text-xs text-neutral-500">Coming soon</div>
                                            </div>
                                        </div>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        disabled
                                        className="w-full h-auto py-4 justify-start text-left opacity-60"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#003087]/10 rounded-full flex items-center justify-center">
                                                <Wallet className="w-5 h-5 text-[#003087]" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-base">PayPal</div>
                                                <div className="text-xs text-neutral-500">Coming soon</div>
                                            </div>
                                        </div>
                                    </Button>
                                </>
                            ) : (
                                <div className="animate-in fade-in zoom-in duration-300">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowMPBrick(false)}
                                        className="mb-2 text-muted-foreground hover:text-foreground"
                                    >
                                        ← Back to methods
                                    </Button>

                                    {isLoading || !booking ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <Loader2 className="h-10 w-10 animate-spin text-[#009EE3] mb-4" />
                                            <p className="text-neutral-500">Loading payment secure form...</p>
                                        </div>
                                    ) : (
                                        <CardPaymentBrick
                                            amount={amount}
                                            providerId={booking?.provider_id}
                                            userId={booking?.user_id}
                                            payerEmail={booking?.user_email}
                                            items={[
                                                {
                                                    id: bookingId === 'pending' ? 'pending_booking' : bookingId,
                                                    title: booking?.service_title,
                                                    description: booking?.service_description,
                                                    quantity: 1,
                                                    unit_price: amount,
                                                    category_id: "services"
                                                }
                                            ]}
                                            onPaymentResult={handlePaymentResult}
                                        />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
