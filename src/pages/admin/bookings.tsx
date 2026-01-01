import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Search, Eye, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fetchBooks } from "../../api/AdminApi.js";

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({
    totalBookings: 0,
    acceptedCount: 0,
    cancelledCount: 0,
    completedCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // ✅ Fetch bookings from backend
  useEffect(() => {
    const getBookings = async () => {
      try {
        const res = await fetchBooks();

        if (res.success) {
          // Combine all booking arrays into one flat array
          const allBookings = [
            ...(res.data.accepted || []),
            ...(res.data.completed || []),
            ...(res.data.cancelled || []),
            ...(res.data.pending || []),
          ];

          setBookings(allBookings);
          setCounts({
            totalBookings: res.totalBookings,
            acceptedCount: res.acceptedCount,
            cancelledCount: res.cancelledCount,
            completedCount: res.completedCount,
          });
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    getBookings();
  }, []);


  // ✅ Filtered results
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase());

    // Normalize both values to lowercase
    const matchesFilter =
      filter === "all" ||
      booking.status?.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });



  // ✅ Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return "bg-[#FF7A00] text-white";

      case "accepted":
        return "bg-[#22C55E] text-white";
      case "completed":
        return "bg-[#A0A0A0] text-white";
      case "cancelled":
        return "bg-[#EF4444] text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ✅ Local stats
  const totalAmount = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  const handleCancelBooking = (id) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bookings Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all service bookings on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {counts.totalBookings}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {counts.acceptedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {counts.completedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {counts.cancelledCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[
              "all",
              "pending",
              "accepted",
              "completed",
              "cancelled",
            ].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or booking ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <span className="font-semibold text-foreground">
                          {booking.id}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.user_name || "—"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {booking.providerDetails?.name || "—"}

                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {booking.service_title || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {booking.scheduled_date
                          ? format(
                            booking.scheduled_date.toDate
                              ? booking.scheduled_date.toDate()
                              : new Date(booking.scheduled_date),
                            "MMM d, h:mm a"
                          )
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <span className="font-semibold text-foreground">
                          ${booking.total_amount || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status
                            ? booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1).replace("_", " ")
                            : "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.status !== "cancelled" &&
                            booking.status !== "completed" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <XCircle className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No bookings found
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

export default BookingsManagement;
