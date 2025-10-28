import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { mockAnalytics, mockBookings, mockProviders, mockPayments } from '../../lib/mockData';
import { Users, DollarSign, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Calculate key metrics
  const totalUsers = 127;
  const totalRevenue = mockPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const activeBookings = mockBookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status)).length;
  const pendingApprovals = mockProviders.filter((p) => p.approvalStatus === 'pending').length;

  const monthlyRevenue = [
    { month: 'Jan', revenue: 12400 },
    { month: 'Feb', revenue: 15398 },
    { month: 'Mar', revenue: 19800 },
    { month: 'Apr', revenue: 13908 },
    { month: 'May', revenue: 14800 },
    { month: 'Jun', revenue: 13800 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor platform performance and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">+12 this month</p>
              </div>
              <Users className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-accent font-bold">${totalRevenue}</p>
                <p className="text-xs text-muted-foreground mt-1">+$5,234 this month</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{activeBookings}</p>
                <p className="text-xs text-muted-foreground mt-1">In progress</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-red-500">{pendingApprovals}</p>
                <p className="text-xs text-muted-foreground mt-1">Provider applications</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--accent))',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(25 100% 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(25 100% 50%)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Breakdown</CardTitle>
            <CardDescription>Distribution by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAnalytics.serviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/users')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">users</p>
                <p className="text-2xl font-bold text-white mt-1">87</p>
              </div>
              <Users className="w-8 h-8 text-accent/40" />
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-accent hover:text-orange-600">
              View & Manage <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/providers')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Service Providers</p>
                <p className="text-2xl font-bold text-white mt-1">40</p>
              </div>
              <Badge className="bg-accent/20 text-accent">
                {pendingApprovals} pending
              </Badge>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-accent hover:text-orange-600">
              Manage Providers <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/bookings')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Bookings</p>
                <p className="text-2xl font-bold text-white mt-1">234</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                {activeBookings} active
              </Badge>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-accent hover:text-orange-600">
              View Bookings <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/orders')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Orders</p>
                <p className="text-2xl font-bold text-white mt-1">156</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-accent hover:text-orange-600">
              View Orders <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/payments')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Payments</p>
                <p className="text-2xl font-bold text-accent font-bold">${totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent/40" />
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-accent hover:text-orange-600">
              View Payments <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200" onClick={() => navigate('/admin/services')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Services</p>
                <p className="text-2xl font-bold text-white mt-1">8</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-accent hover:text-orange-600">
              Manage Services <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;