import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { TrendingUp } from "lucide-react";

import {
  generateRevenueData,
  generateServiceBreakdown,
} from "../../api/analytics.js";

import {
  fetchBooks,
  fetchCounts,
  fetchserviceproviders,
} from "../../api/AdminApi.js";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

// ✅ Add type definitions
interface RevenueData {
  month: string;
  revenue: number;
  totalRevenue: number;
}

interface ServiceData {
  name: string;
  value: number;
}

interface ProviderData {
  name: string;
  jobs: number;
}

interface CountsData {
  acceptedCount: number;
  cancelledCount: number;
  completedCount: number;
  pendingCount: number;
  totalBookings: number;
}

interface StatsData {
  totalBookings: number;
  completedBookings: number;
  completionRate: number | string; // ✅ Allow string for percentage
  cancellationRate: number | string; // ✅ Allow string for percentage
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("6months");

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [bookingData, setBookingData] = useState([]);
  const [providerChart, setProviderChart] = useState<ProviderData[]>([]);

  const [counts, setCounts] = useState<CountsData>({
    acceptedCount: 0,
    cancelledCount: 0,
    completedCount: 0,
    pendingCount: 0,
    totalBookings: 0,
  });

  const [stats, setStats] = useState<StatsData>({
    totalBookings: 0,
    completedBookings: 0,
    completionRate: 0,
    cancellationRate: 0,
  });

  // Charts calculated from API
  const monthlyData = revenueData;
  const serviceBreakdown = serviceData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const countsRaw = await fetchCounts();
        const bookingsData = await fetchBooks();
        const providersData = await fetchserviceproviders();

        // 🟢 Format provider stats for chart
        const providerStats: ProviderData[] =
          providersData?.map((p: any) => ({
            name: p.fullName || "Unknown",
            jobs: Array.isArray(p.completedBookings) 
              ? p.completedBookings.length 
              : Number(p.completedBookings) || 0, // ✅ Handle both array and number
          })) || [];

        setProviderChart(providerStats);

        // 🟢 FIX: Normalize counts no matter what shape comes
        const countsData = {
          totalBookings: Number(bookingsData?.totalBookings) || 0, // ✅ Convert to number
          completedCount: Number(bookingsData?.completedCount) || 0, // ✅ Convert to number
          cancelledCount: Number(bookingsData?.cancelledCount) || 0, // ✅ Convert to number
        };

        // 🟢 Compute stats safely
        const total = countsData.totalBookings;
        const completed = countsData.completedCount;
        const cancelled = countsData.cancelledCount;

        const completionRate =
          total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0; // ✅ Convert back to number

        const cancellationRate =
          total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0; // ✅ Convert back to number

        setStats({
          totalBookings: total,
          completedBookings: completed,
          completionRate, // ✅ Now it's a number
          cancellationRate, // ✅ Now it's a number
        });

        // 🟢 Bookings for charts
        const {
          accepted = [],
          completed: comp = [],
          pending = [],
          cancelled: canc = [],
        } = bookingsData.data || {};

        const allBookings = [...accepted, ...comp, ...pending, ...canc];

        setRevenueData(generateRevenueData(comp));
        setServiceData(generateServiceBreakdown(allBookings));
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform performance metrics and trends
          </p>
        </div>

        <div className="flex gap-2">
          {["7days", "30days", "6months", "1year"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range
                .replace("days", "d")
                .replace("months", "m")
                .replace("year", "y")}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ₹
              {revenueData?.length
                ? revenueData[revenueData.length - 1]?.totalRevenue
                : 0}
            </p>
            <p className="text-xs text-green-600 mt-1">↑ 0% from last period</p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {stats.totalBookings}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across all time
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completionRate}%</p>
            <p className="text-xs mt-1">{stats.completedBookings} completed</p>
          </CardContent>
        </Card>

        {/* Cancellation Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancellation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.cancellationRate}%</p>
            <p className="text-xs text-destructive mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Trends
          </CardTitle>
          <CardDescription>
            {monthlyData.length
              ? "Monthly revenue performance"
              : "No revenue data found"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Breakdown</CardTitle>
            <CardDescription>
              {serviceBreakdown.length ? "" : "No data found"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceBreakdown}
                  cx="50%"
                  cy="50%"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {serviceBreakdown.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Providers</CardTitle>
            <CardDescription>
              {providerChart.length ? "By completed jobs" : "No provider data found"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />

                <Bar dataKey="jobs" fill="#3b82f6">
                  {providerChart.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;