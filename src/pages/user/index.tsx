import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { mockBookings, mockPayments, mockMessages } from '../../lib/mockData';
import { Badge } from '../../components/ui/badge';
import { Calendar, DollarSign, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistance, format } from 'date-fns';

const userDashboard = () => {
  const navigate = useNavigate();

  // Get user's bookings
  const userBookings = mockBookings.filter((b) => b.userId === 'user_1');
  const activeBookings = userBookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status));
  const pendingPayments = mockPayments.filter((p) => p.status === 'pending').length;
  const unreadMessages = mockMessages.filter((m) => !m.read && m.receiverId === 'user_1').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-accent/20 text-accent';
      case 'in_progress':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-accent/20 text-accent';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, John!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your services</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{activeBookings.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Services in progress</p>
              </div>
              <Calendar className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{pendingPayments}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{unreadMessages}</p>
                <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Premium Member</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <Badge variant="success">Active</Badge>
                <p className="text-xs text-muted-foreground mt-2">Until Dec 24, 2024</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Bookings</CardTitle>
                  <CardDescription>Your ongoing and upcoming services</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/user/bookings')} className="text-accent border-border hover:bg-accent/10">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.map((booking) => (
                    <div key={booking.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 hover:border-accent/30 transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">{booking.serviceId === 'svc_1' ? 'General Cleaning' : 'Pipe Repair'}</p>
                          <p className="text-sm text-muted-foreground">{booking.address}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Provider</p>
                          <p className="font-medium text-white">{booking.providerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date & Time</p>
                          <p className="font-medium text-white">{format(booking.date, 'MMM d, h:mm a')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium text-accent font-bold">${booking.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active bookings yet</p>
                  <Button onClick={() => navigate('/user/book')} variant="default">
                    Book a Service
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start text-white border-border hover:text-accent hover:bg-accent/10"
                variant="outline"
                onClick={() => navigate('/user/book')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book a Service
              </Button>
              <Button
                className="w-full justify-start text-white border-border hover:text-accent hover:bg-accent/10"
                variant="outline"
                onClick={() => navigate('/user/marketplace')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Browse Marketplace
              </Button>
              <Button
                className="w-full justify-start text-white border-border hover:text-accent hover:bg-accent/10"
                variant="outline"
                onClick={() => navigate('/user/subscription')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button
                className="w-full justify-start text-white border-border hover:text-accent hover:bg-accent/10"
                variant="outline"
                onClick={() => navigate('/user/payments')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Payment History
              </Button>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMessages.slice(0, 3).map((msg) => (
                  <div key={msg.id} className="text-sm pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-start gap-2">
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-xs">{msg.senderName}</p>
                        <p className="text-muted-foreground truncate text-xs">{msg.content}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {formatDistance(msg.timestamp, new Date(), { addSuffix: true })}
                        </p>
                      </div>
                      {!msg.read && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default userDashboard;