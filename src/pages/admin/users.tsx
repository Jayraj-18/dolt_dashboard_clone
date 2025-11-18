import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

import {
  MoreHorizontal,
  Search,
  Filter,
  Shield,
  User,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";
import { fetchCounts, fetchUsers } from "../../api/AdminApi.js";

// ✅ Fix the User interface with proper createdAt type
interface User {
  id: string;
  fullName: string;
  email: string;
  address?: string;
  profilePic?: string;
  createdAt?: {
    _seconds: number;
    _nanoseconds?: number;
  } | string; // ✅ Allow both Firestore Timestamp and string
}

// ✅ Add Counts interface
interface CountsData {
  homeownerCount: number;
  serviceProviderCount: number;
  totalUsers: number;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [counts, setCounts] = useState<CountsData>({
    homeownerCount: 0,
    serviceProviderCount: 0,
    totalUsers: 0,
  });

  // Load Counts + Users
  useEffect(() => {
    const loadData = async () => {
      try {
        const countData = await fetchCounts();
        const userList = await fetchUsers();
        // console.log("Fetched Users:", userList);

        setCounts(countData);
        setUsers(userList);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // 🔍 Searching
  const filteredUsers = users.filter((user) => {
    const searchMatch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  // Delete User
  const handleDelete = async () => {
    if (!selectedUser) return;

    setProcessingId(selectedUser.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      setUsers(users.filter((u) => u.id !== selectedUser.id));

      toast.success(`${selectedUser.fullName} has been deleted`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Helper function to format date safely
  const formatDate = (createdAt?: { _seconds: number } | string): string => {
    if (!createdAt) return "N/A";

    try {
      if (typeof createdAt === "string") {
        return new Date(createdAt).toLocaleDateString();
      }
      
      if (typeof createdAt === "object" && "_seconds" in createdAt) {
        return new Date(createdAt._seconds * 1000).toLocaleDateString();
      }

      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage user accounts
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{counts.homeownerCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Registered Users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Currently Active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-left py-3 px-4">Joined</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.profilePic ||
                            `https://avatar.vercel.sh/${user.email}`
                          }
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium">{user.fullName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-4 h-4" /> {user.email}
                      </div>
                    </td>

                    <td className="py-3 px-4">{user.address || "—"}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {/* ✅ Use the helper function */}
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;