import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button"; // Import Button
import { format } from "date-fns";
import { getProviderOrders, acceptOrder, updateOrderStatus } from "../../api/orders"; // Import updateOrderStatus
import { toast } from "sonner";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

const ProductOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // Track specific order being acted on

    const fetchOrders = async () => {
        try {
            const fetchedOrders = await getProviderOrders(user?.id);
            setOrders(fetchedOrders.data || []);
        } catch (error) {
            toast.error("Failed to load orders");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAcceptOrder = async (orderId: string) => {
        if (!user?.id) return;
        setActionLoading(orderId);
        try {
            await acceptOrder(orderId, user.id);
            toast.success("Order accepted successfully!");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || "Failed to accept order");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        if (!user?.id) return;
        setActionLoading(orderId);
        try {
            await updateOrderStatus(orderId, status, user.id);
            toast.success(`Order marked as ${status}!`);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || `Failed to mark as ${status}`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-[#22C55E] text-white";
            case "shipped":
                return "bg-[#FF7A00] text-white";
            case "processing":
            case "accepted":
                return "bg-blue-500 text-white";
            case "pending":
            case "pending_payment":
                return "bg-[#A0A0A0] text-white";
            case "cancelled":
                return "bg-destructive text-destructive-foreground";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    if (loading) {
        return <div>Loading orders...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Product Orders</h1>
                <p className="text-muted-foreground mt-1">Manage orders placed for your products</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Acceptance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">
                            {orders.filter(o => !o.isBooked).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Accepted by Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">
                            {orders.filter(o => o.providerId === user?.id).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {/* Calculate revenue only for orders accepted by this provider */}
                            ${orders.filter(o => o.providerId === user?.id).reduce((sum, o) => sum + (o.total_amount || 0), 0).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <CardTitle className="text-lg">Order {order.id.slice(0, 8).toUpperCase()}</CardTitle>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {order.created_at ? format(new Date(order.created_at), "MMM d, yyyy h:mm a") : "—"}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Customer: <span className="text-foreground font-medium">{order.username || "Unknown"}</span>
                                        {order.details?.email && <span className="ml-2 text-muted-foreground">({order.details.email})</span>}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={getStatusColor(order.status)}>
                                        {order.status?.replace('_', ' ').toUpperCase() || "UNKNOWN"}
                                    </Badge>
                                    <div className="text-lg font-bold">
                                        ${(order.total_amount || 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Package className="w-4 h-4" /> Order Items
                                    </h4>
                                    <div className="space-y-3 bg-muted/20 p-3 rounded-md">
                                        {(order.items || []).map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>{item.name || "Product"} <span className="text-muted-foreground">x{item.quantity}</span></span>
                                                <span className="font-mono">${item.price}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-sm">
                                            <span>Total</span>
                                            <span>${(order.total_amount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Truck className="w-4 h-4" /> Shipping Details
                                    </h4>
                                    <div className="text-sm space-y-1 bg-muted/20 p-3 rounded-md mb-4">
                                        <p><span className="text-muted-foreground">Address:</span> {order.details?.address || "N/A"}</p>
                                        <p><span className="text-muted-foreground">City:</span> {order.details?.city || "N/A"}, {order.details?.zipCode || "N/A"}</p>
                                        <p><span className="text-muted-foreground">Phone:</span> {order.details?.phoneNumber || order.details?.phone || "N/A"}</p>
                                    </div>

                                    {/* Accept/Process Button Logic */}
                                    {!order.isBooked ? (
                                        <Button
                                            className="w-full"
                                            onClick={() => handleAcceptOrder(order.id)}
                                            disabled={actionLoading === order.id}
                                        >
                                            {actionLoading === order.id ? "Accepting..." : "Accept Order"}
                                        </Button>
                                    ) : (
                                        order.providerId === user?.id && (
                                            <div className="space-y-2">
                                                <Button variant="outline" className="w-full cursor-default hover:bg-background" >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    {order.status === 'delivered' ? 'Delivered' :
                                                        order.status === 'shipped' ? 'Shipped' : 'Accepted by You'}
                                                </Button>

                                                {/* Status Transitions */}
                                                {(order.status === 'accepted' || order.status === 'processing') && (
                                                    <Button
                                                        className="w-full bg-[#FF7A00] hover:bg-[#E06900] text-white"
                                                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                                        disabled={actionLoading === order.id}
                                                    >
                                                        {actionLoading === order.id ? "Updating..." : "Mark as Shipped"}
                                                    </Button>
                                                )}

                                                {order.status === 'shipped' && (
                                                    <Button
                                                        className="w-full bg-[#22C55E] hover:bg-[#1DA850] text-white"
                                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                                        disabled={actionLoading === order.id}
                                                    >
                                                        {actionLoading === order.id ? "Updating..." : "Mark as Delivered"}
                                                    </Button>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProductOrders;
