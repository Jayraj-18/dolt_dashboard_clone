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
import { Wrench, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Booking } from "@/types/booking";
import axios from "axios";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { ReviewModal } from "../../components/bookings/ReviewModal";

const Bookings = () => {
  const { user, bookings, fetchBookings, cancelBooking, loadingBookings } =
    useAuth();

  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [canceling, setCanceling] = useState<string | null>(null);

  // Review Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // ✅ Format date safely
// Format Firestore Timestamp
const formatDate = (timestamp: any) => {
  if (!timestamp?._seconds) return "—";

  const date = new Date(timestamp._seconds * 1000);
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  // ✅ Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#22C55E] text-white";
      case "accepted":
        return "bg-[#FF7A00] text-white";
      case "pending":
        return "bg-[#FACC15] text-black";
      case "cancelled":
        return "bg-[#EF4444] text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ✅ Fetch bookings when user logs in
  useEffect(() => {
    if (user?.id) {
      fetchBookings(user.id);
    }
  }, [user]);

  const [searchParams] = useSearchParams();
  const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://api.d0lt.local:5000";

  // Handle Post-Payment Booking Creation
  useEffect(() => {
    const action = searchParams.get("action");
    const paymentId = searchParams.get("payment_id"); // MP returns this

    if (action === "payment_success" && user?.id) {
      const pendingBookingStr = localStorage.getItem("pendingBooking");

      if (pendingBookingStr) {
        const createPendingBooking = async () => {
          try {
            const bookingData = JSON.parse(pendingBookingStr);

            // Enrich with payment info if needed
            const finalBookingData = {
              ...bookingData,
              paymentId: paymentId,
              status: 'pending' // Or 'accepted' depending on business logic
            };

            const response = await axios.post(`${BACKEND_URL}/api/bookings/createBooking`, finalBookingData);

            if (response.status === 201) {
              toast.success("Payment successful! Booking confirmed.");
              localStorage.removeItem("pendingBooking");
              // Refresh list
              fetchBookings(user.id);
              // Clean URL
              window.history.replaceState({}, '', '/user/bookings');
            }
          } catch (error) {
            console.error("Failed to finalize booking:", error);
            toast.error("Payment received but failed to create booking record. Please contact support.");
          }
        };

        createPendingBooking();
      }
    } else if (action === "payment_failure") {
      toast.error("Payment failed or was cancelled.");
    }
  }, [searchParams, user]);

  // ✅ Apply filters whenever bookings or active filter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredBookings(bookings);
    } else if (activeFilter === "cancelled") {
      setFilteredBookings(
        bookings.filter((b) => b.status === "cancelled" || b.isCancelled)
      );
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === activeFilter));
    }
  }, [bookings, activeFilter]);



  
  // ✅ Cancel booking handler
  const handleCancelBooking = async (bookingId: string) => {
    setCanceling(bookingId);
    const success = await cancelBooking(bookingId);
    if (success) {
      setFilteredBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: "cancelled", isCancelled: true }
            : b
        )
      );
    }
    setCanceling(null);
  };

  // ✅ Booking stats
  const stats = [
    { label: "All", value: bookings.length, key: "all" },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      key: "completed",
    },
    {
      label: "Accepted",
      value: bookings.filter((b) => b.status === "accepted").length,
      key: "accepted",
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
      key: "pending",
    },
    {
      label: "Cancelled",
      value: bookings.filter((b) => b.status === "cancelled" || b.isCancelled)
        .length,
      key: "cancelled",
    },
  ];




  // ✅ Loading
  if (loadingBookings) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your service bookings
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.key}
            onClick={() => setActiveFilter(stat.key)}
            className={`cursor-pointer transition-all duration-200 ${activeFilter === stat.key
                ? "ring-2 ring-primary"
                : "hover:ring-1 hover:ring-muted-foreground"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {booking.service_title}
                    </CardTitle>
                    <CardDescription>
                      Booked on {formatDate(booking.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    <span>Provider ID:</span>{" "}
                    <span className="text-foreground font-medium">
                      {booking.provider_id}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    <span>Price:</span>{" "}
                    <span className="text-foreground font-medium">
                      {booking.currency} {booking.total_amount}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {booking.service_description}
                </p>

                <div className="flex gap-2">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={canceling === booking.id}
                        onClick={() => handleCancelBooking(booking.id)} // ✅ FIXED
                      >
                        {canceling === booking.id ? (
                          <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Cancel Booking
                      </Button>

                      <Button variant="outline" size="sm" className="flex-1">
                        <Clock className="w-4 h-4 mr-2" />
                        Waiting for approval
                      </Button>
                    </>
                  )}

                  {booking.status === "accepted" && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Wrench className="w-4 h-4 mr-2" />
                      Service Scheduled
                    </Button>
                  )}

                  {booking.status === "completed" && (
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => {
                        setReviewBooking(booking);
                        setIsReviewOpen(true);
                      }}
                      disabled={!!booking.rating || !!booking.hasIssue} // Disable if already rated or has issue
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {booking.hasIssue ? "Disputed" : booking.rating ? "Reviewed" : "Leave Review"}
                    </Button>
                  )}

                  {booking.status === "cancelled" && (
                    <Button variant="destructive" size="sm" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelled
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No {activeFilter !== "all" ? activeFilter : ""} bookings found.
              </p>
              <Button
                onClick={() => (window.location.href = "/user/book")}
              >
                Book a Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          booking={reviewBooking}
          onSuccess={() => {
            fetchBookings(user.id); // Refresh list
          }}
        />
      )}
    </div>
  );
};

export default Bookings;
