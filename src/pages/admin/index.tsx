import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Users, DollarSign, TrendingUp, ArrowRight } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
import { fetchCounts, fetchBooks } from "../../api/AdminApi.js";
import { getAllServices } from "../../api/ServiceApi.js";
import {
  generateRevenueData,
  generateServiceBreakdown,
} from "../../Api/analytics.js";

// ✅ Add type definitions
interface CountsData {
  homeownerCount: number;
  serviceProviderCount: number;
  totalUsers: number;
}

interface BookingData {
  accepted?: any[];
  completed?: any[];
  pending?: any[];
  cancelled?: any[];
}

interface BookingsResponse {
  data?: BookingData;
  totalBookings?: number;
  acceptedCount?: number;
  completedCount?: number;
  cancelledCount?: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  totalRevenue: number;
}

interface ServiceData {
  name: string;
  value: number;
}

interface Service {
  id: string;
  name: string;
  [key: string]: any;
}

const AdminDashboard = () => {
  const [counts, setCounts] = useState<CountsData>({
    homeownerCount: 0,
    serviceProviderCount: 0,
    totalUsers: 0,
  });

  const [bookings, setBookings] = useState<BookingsResponse>({});
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countsData, bookingsData] = await Promise.all([
          fetchCounts(),
          fetchBooks(),
        ]);

        setCounts(countsData);
        setBookings(bookingsData);

        // Extract arrays
        const {
          accepted = [],
          completed = [],
          pending = [],
          cancelled = [],
        } = bookingsData.data || {};

        const allBookings = [
          ...accepted,
          ...completed,
          ...pending,
          ...cancelled,
        ];

        // Create chart data
        setRevenueData(generateRevenueData(completed));
        setServiceData(generateServiceBreakdown(allBookings));
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };

    fetchServices();
  }, []);

  const { homeownerCount, serviceProviderCount, totalUsers } = counts;
  
  // ✅ Fix: Calculate active bookings from the data structure
  const activeBookings = bookings.data 
    ? (bookings.data.accepted?.length || 0) + (bookings.data.pending?.length || 0)
    : 0;
    
  const loading = totalUsers === 0;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const latestTotal =
    revenueData.length > 0
      ? revenueData[revenueData.length - 1].totalRevenue
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor platform performance and key metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">
                  {loading ? "Loading..." : totalUsers}
                </p>
              </div>
              <Users className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl text-accent font-bold">
                  $ {totalRevenue}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {latestTotal} this month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-muted-foreground">
              Active Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">
                  {/* ✅ Fix Line 181: Use acceptedCount from bookings object */}
                  {bookings.acceptedCount || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  In progress
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--accent))",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(25 100% 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(25 100% 50%)", r: 4 }}
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
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
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

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Users */}
        <Card
          className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/admin/users")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Users
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {homeownerCount}
                </p>
              </div>
              <Users className="w-8 h-8 text-accent/40" />
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-accent hover:text-orange-600"
            >
              View & Manage <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Providers */}
        <Card
          className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/admin/providers")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Service Providers
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {serviceProviderCount}
                </p>
              </div>
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-accent hover:text-orange-600"
            >
              Manage Providers <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Bookings */}
        <Card
          className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/admin/bookings")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Bookings
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {/* ✅ Fix Line 353: Use totalBookings from bookings object */}
                  {bookings.totalBookings || 0}
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                {activeBookings} active
              </Badge>
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-accent hover:text-orange-600"
            >
              View Bookings <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card
          className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/admin/orders")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Orders
                </p>
                <p className="text-2xl font-bold text-white mt-1">{0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-accent hover:text-orange-600"
            >
              View Orders <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card
          className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/admin/payments")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Payments
                </p>
                <p className="text-2xl text-accent font-bold">${0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent/40" />
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-accent hover:text-orange-600"
            >
              View Payments <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Services */}
        <Card
          className="cursor-pointer hover:shadow-orange-glow/50 hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/admin/services")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Services
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {services.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
            <Button
              variant="link"
              className="mt-4 p-0 h-auto text-accent hover:text-orange-600"
            >
              Manage Services <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;