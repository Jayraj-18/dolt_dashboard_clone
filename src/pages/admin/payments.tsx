import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Search, Download, RotateCcw } from 'lucide-react';
// import { fetchPayments } from '../../api/AdminApi.js';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // useEffect(() => {
  //   const loadPayments = async () => {
  //     const data = await fetchPayments();
  //     setPayments(data);
  //   };
  //   loadPayments();
  // }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || payment.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-[#22C55E] text-white';
      case 'pending': return 'bg-[#FF7A00] text-white';
      case 'failed': return 'bg-[#EF4444] text-white';
      case 'refunded': return 'bg-[#A0A0A0] text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const failedCount = payments.filter((p) => p.status === 'failed').length;

  const handleRefund = (id) => {
    setPayments(payments.map((p) =>
      p.id === id ? { ...p, status: 'refunded' } : p
    ));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments & Refunds</h1>
          <p className="text-muted-foreground mt-1">Manage payment processing and refunds</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-destructive">{failedCount}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{payments.length}</p></CardContent></Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader><CardTitle>Filter & Search</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
              <Button key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize">
                {status}
              </Button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by payment ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader><CardTitle>Payment Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold">{p.id}</TableCell>
                      <TableCell>{p.bookingId}</TableCell>
                      <TableCell>{p.customerName || `User #${p.userId}`}</TableCell>
                      <TableCell>${p.amount}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                      <TableCell><Badge className={getStatusColor(p.status)}>{p.status}</Badge></TableCell>
                      <TableCell>
                        {p.status === 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => handleRefund(p.id)}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsManagement;
