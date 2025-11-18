import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Package, Truck, CheckCircle2, Download, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-[#22C55E] text-white";
      case "shipped":
      case "processing":
        return "bg-[#FF7A00] text-white";
      case "pending":
        return "bg-[#A0A0A0] text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    return steps.indexOf(status);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Order History</h1>
        <p className="text-muted-foreground mt-1">Track your product orders and deliveries</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              {orders.filter((o) => o.status === "delivered").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {orders.filter((o) => o.status === "shipped").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ${orders.reduce((sum, o) => sum + (o.total || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const statusStep = getStatusStep(order.status);

          return (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Order {order.id}</CardTitle>
                    <CardDescription>
                      {order.date ? format(new Date(order.date), "MMM d, yyyy") : "—"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status
                      ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                      : "Unknown"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {(order.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{item.name || "Product"}</span>
                        <div className="text-right">
                          <span className="text-muted-foreground">x{item.quantity || 1}</span>
                          <span className="text-foreground font-medium ml-4">
                            ${item.price || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total || 0}</span>
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Delivery Status</h4>
                  <div className="flex items-center justify-between">
                    {["Order Placed", "Processing", "Shipped", "Delivered"].map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            idx <= statusStep
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {idx < statusStep ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-semibold">{idx + 1}</span>
                          )}
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">{step}</p>
                        {idx !== 3 && (
                          <div
                            className={`flex-1 h-1 mx-1 mt-3 ${
                              idx < statusStep ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Details */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Timeline</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Placed</span>
                      <span className="text-foreground">
                        {order.date ? format(new Date(order.date), "MMM d, yyyy") : "—"}
                      </span>
                    </div>
                    {order.shippingDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipped</span>
                        <span className="text-foreground">
                          {format(new Date(order.shippingDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    {order.deliveryDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered</span>
                        <span className="text-foreground">
                          {format(new Date(order.deliveryDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Invoice
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Support
                  </Button>
                  {order.status === "delivered" && (
                    <Button className="flex-1" size="sm">
                      Leave Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button onClick={() => (window.location.href = "/user/marketplace")}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Orders;
