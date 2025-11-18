import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useState,useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { DollarSign, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

const Earnings = () => {
  // Empty values for future backend data
  const providerPayments = [];
  const completedEarnings = 0;
  const pendingEarnings = 0;



  // Empty payout history
  const payoutHistory = [];
  const [providerBookings, setProviderBookings] = useState([]);
const [totalEarnings, setTotalEarnings] = useState(0);
const [completedJobs, setCompletedJobs] = useState(0);
const [monthlyData, setMonthlyData] = useState([]);

  const { user } = useAuth();
  const Backend_URL =
  import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";


useEffect(() => {
  if (!user?.id) return;

  const fetchData = async () => {
    try {
      const res = await axios.post(`${Backend_URL}/api/provider/earnings`, {
        providerId: user.id,
      });

      // console.log("Completed Bookings:", res.data);

      setProviderBookings(res.data.bookings);
      setTotalEarnings(res.data.totalEarnings);
      setCompletedJobs(res.data.completedJobs);
      setMonthlyData(res.data.monthlyData);


    } catch (error) {
      console.error("Error fetching provider bookings:", error);
    }
  };

  fetchData();
}, [user]);

const latestMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null;


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Earnings</h1>
        <p className="text-muted-foreground mt-1">Track your income and payouts</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Earned */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">${totalEarnings}</p>
                <p className="text-xs text-muted-foreground mt-1">All-time</p>
              </div>
              <DollarSign className="w-8 h-8 text-success/40" />
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-warning">${pendingEarnings}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
              </div>
              <TrendingUp className="w-8 h-8 text-warning/40" />
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
              <p className="text-3xl font-bold text-foreground">{latestMonth ? latestMonth.earnings : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{completedJobs} completed jobs</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Trend</CardTitle>
          <CardDescription>Your earnings over the last months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--success))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Jobs vs Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs & Earnings</CardTitle>
          <CardDescription>Completed jobs and corresponding earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="jobs" fill="hsl(var(--primary))" name="Jobs Completed" />
              <Bar dataKey="earnings" fill="hsl(var(--success))" name="Earnings ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your recent payouts and pending transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payoutHistory.length === 0 && (
              <p className="text-muted-foreground text-sm">No payout history available.</p>
            )}

            {/* Pending Payout */}
            {pendingEarnings > 0 && (
              <div className="border-2 border-warning rounded-lg p-4 bg-warning/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">Pending Payout</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your next payout will be processed soon
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-lg text-warning">${pendingEarnings}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
          <CardDescription>Manage your payout method and frequency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground">Bank Account</p>
            <p className="text-sm text-muted-foreground mt-1">No bank details added</p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <p className="font-semibold text-foreground">Payout Frequency</p>
            <p className="text-sm text-muted-foreground mt-1">Not set</p>
          </div>

          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Tax Forms
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;
