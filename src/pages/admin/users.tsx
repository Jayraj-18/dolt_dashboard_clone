import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { MoreHorizontal, Search, Filter, Shield, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  bookings: number;
  subscription: 'premium' | 'free';
  joined: string;
  status: 'active' | 'inactive' | 'suspended';
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com',
      bookings: 12,
      subscription: 'premium',
      joined: '2023-01-15',
      status: 'active',
    },
    {
      id: 'user_2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      bookings: 5,
      subscription: 'free',
      joined: '2023-06-20',
      status: 'active',
    },
    {
      id: 'user_3',
      name: 'Robert Brown',
      email: 'robert@example.com',
      bookings: 8,
      subscription: 'premium',
      joined: '2023-03-10',
      status: 'active',
    },
    {
      id: 'user_4',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      bookings: 0,
      subscription: 'free',
      joined: '2024-05-01',
      status: 'inactive',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const searchMatch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const filterMatch =
      filter === 'all' ||
      filter === 'premium'
        ? user.subscription === 'premium'
        : filter === 'free'
          ? user.subscription === 'free'
          : filter === 'active'
            ? user.status === 'active'
            : user.status === 'suspended';
    return searchMatch && filterMatch;
  });

  const handleSuspend = async (user: User) => {
    setProcessingId(user.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, status: 'suspended' as const } : u
        )
      );
      toast.success(`${user.name} has been suspended`);
    } catch (error) {
      toast.error('Failed to suspend user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setProcessingId(selectedUser.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      toast.success(`${selectedUser.name} has been deleted`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReactivate = async (user: User) => {
    setProcessingId(user.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, status: 'active' as const } : u
        )
      );
      toast.success(`${user.name} has been reactivated`);
    } catch (error) {
      toast.error('Failed to reactivate user');
    } finally {
      setProcessingId(null);
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    return subscription === 'premium'
      ? 'bg-[#FF7A00] text-white'
      : 'bg-[#A0A0A0] text-white';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#22C55E] text-white';
      case 'suspended':
        return 'bg-[#EF4444] text-white';
      default:
        return 'bg-[#A0A0A0] text-white';
    }
  };

  const activeCount = users.filter((u) => u.status === 'active').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const premiumCount = users.filter((u) => u.subscription === 'premium').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">View and manage user accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground mt-1">+5 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Premium Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{premiumCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((premiumCount / users.length) * 100)}% of users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((activeCount / users.length) * 100)}% engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{suspendedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((suspendedCount / users.length) * 100)}% of users</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {['all', 'premium', 'free', 'active', 'suspended'].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Manage and view user profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Bookings</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Subscription</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Joined</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://avatar.vercel.sh/${user.email}`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-foreground font-medium">{user.bookings}</td>
                    <td className="py-3 px-4">
                      <Badge className={getSubscriptionColor(user.subscription)}>
                        {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {user.joined}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={processingId === user.id}>
                            {processingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <User className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" />
                            View Bookings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleSuspend(user)}
                            >
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                          {user.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => handleReactivate(user)}>
                              Reactivate Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              All their bookings and data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-destructive/10 p-4 rounded-lg mb-4">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> This will also delete all related booking history, payments, and ratings.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processingId === selectedUser?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processingId === selectedUser?.id ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;