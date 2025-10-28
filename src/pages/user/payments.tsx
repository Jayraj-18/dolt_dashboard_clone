import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockPayments, mockBookings } from '../../lib/mockData';
import { DollarSign, Download, Filter, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const Payments = () => {
  const userPayments = mockPayments.filter((p) => p.userId === 'user_1');

  const totalSpent = userPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = mockPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#22C55E] text-white';
      case 'pending':
        return 'bg-[#FF7A00] text-white';
      case 'failed':
        return 'bg-[#EF4444] text-white';
      case 'refunded':
        return 'bg-[#A0A0A0] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground mt-1">View and manage your transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">${totalSpent}</p>
                <p className="text-xs text-muted-foreground mt-1">All-time</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-warning">${pendingAmount}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
              </div>
              <TrendingUp className="w-8 h-8 text-warning/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">$230</p>
                <p className="text-xs text-muted-foreground mt-1">3 transactions</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </div>
            <Button>Add Payment Method</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="text-3xl">💳</div>
              <div>
                <p className="font-semibold text-foreground">Visa Card</p>
                <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
              </div>
            </div>
            <Badge>Primary</Badge>
          </div>
          <div className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🏦</div>
              <div>
                <p className="font-semibold text-foreground">Bank Account</p>
                <p className="text-sm text-muted-foreground">Wells Fargo - Checking</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent payments and refunds</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userPayments.map((payment) => {
              const booking = mockBookings.find((b) => b.id === payment.bookingId);

              return (
                <div key={payment.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">{getMethodIcon(payment.method)}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {booking ? `Payment for ${booking.serviceId === 'svc_1' ? 'General Cleaning' : 'Pipe Repair'}` : 'Service Payment'}
                        </p>
                        <p className="text-sm text-muted-foreground">{format(payment.date, 'MMM d, yyyy')} • {payment.method === 'card' ? 'Credit Card' : 'Bank Transfer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">${payment.amount}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {payment.status === 'completed' && (
                    <div className="mt-3 flex gap-2 pt-3 border-t border-border">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Get Receipt
                      </Button>
                    </div>
                  )}
                  {payment.status === 'failed' && (
                    <div className="mt-3">
                      <Button size="sm" className="w-full">
                        Retry Payment
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Settings</CardTitle>
          <CardDescription>Manage your billing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Automatic Payments</p>
              <p className="text-sm text-muted-foreground">Auto-pay upcoming invoices</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Payment Reminders</p>
              <p className="text-sm text-muted-foreground">Get email reminders before due dates</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Receipt Delivery</p>
              <p className="text-sm text-muted-foreground">Email receipts for all transactions</p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;