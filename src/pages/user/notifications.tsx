import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Bell, Check, Trash2, Archive } from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your cleaning service with Sarah Johnson is confirmed for tomorrow at 10:00 AM',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'Your payment of $80.00 for General Cleaning has been processed successfully',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      message: 'Mike Chen sent you a message about your plumbing service',
      timestamp: new Date(Date.now() - 86400000),
      read: true,
    },
    {
      id: '4',
      type: 'system',
      title: 'Promotion',
      message: 'Get 20% off your next booking with code SUMMER20',
      timestamp: new Date(Date.now() - 172800000),
      read: true,
    },
    {
      id: '5',
      type: 'booking',
      title: 'Provider Arrived',
      message: 'Sarah Johnson has arrived and started your cleaning service',
      timestamp: new Date(Date.now() - 259200000),
      read: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayNotifications =
    activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-[#FF7A00] text-white';
      case 'payment':
        return 'bg-[#22C55E] text-white';
      case 'message':
        return 'bg-[#FF7A00] text-white';
      case 'system':
        return 'bg-[#A0A0A0] text-white';
      default:
        return 'bg-[#A0A0A0] text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💳';
      case 'message':
        return '💬';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {displayNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            displayNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-2xl mt-1 flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type.charAt(0).toUpperCase() +
                            notification.type.slice(1)}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;