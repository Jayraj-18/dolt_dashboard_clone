import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";

// ✅ Import everything from AuthContext
import { useAuth } from "@/contexts/AuthContext";

const ProviderDashboard = () => {
  const navigate = useNavigate();

  // ✅ Extract everything from AuthContext (FIXED NAMING)
  const {
    user,
    bookings,
    fetchBookings,
    loadingBookings,
    providerBookings, // ✅ Fixed: was "providerbookings"
    fetchBookingsProviders,
    handleAccept,
    handleComplete, // ✅ Added
    loadingProviderBookings, // ✅ Fixed: was "loadingproviderBookings"
  } = useAuth();

  const Backend_URL =
    import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://api.d0lt.local:5000";

  // ✅ Fetch provider bookings when user loads
  useEffect(() => {
    if (user?.id) {
      fetchBookingsProviders(user.id);
    }
  }, [user]);

  // ✅ Filter bookings related to provider (REMOVED inProgressJobs)
  const { assignedJobs, completedJobs } = useMemo(() => {
    const providerJobs = providerBookings.filter(
      (b) => b.provider_id === user?.id
    );
    const assigned = providerJobs.filter((b) =>
      ["pending", "accepted"].includes(b.status)
    );
    const completed = providerJobs.filter((b) => b.status === "completed");

    return {
      assignedJobs: assigned,
      completedJobs: completed,
    };
  }, [providerBookings, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "accepted":
      case "in_progress":
        return "bg-blue-500/20 text-blue-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ✅ Job Card Component
  const JobCard = ({ job }) => {
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [completeLoading, setCompleteLoading] = useState(false);

    const handleCompleteJob = async (jobId) => {
      try {
        setCompleteLoading(true);
        await axios.put(`${Backend_URL}/api/bookings/${jobId}`, {
          status: "completed",
        });
        alert("Job marked as completed ✅");
        await fetchBookingsProviders(user.id);
      } catch (err) {
        console.error("Error marking complete:", err);
        alert("Failed to mark job as complete");
      } finally {
        setCompleteLoading(false);
      }
    };

    const handleAcceptJob = async (job) => {
      try {
        setAcceptLoading(true);
        await handleAccept(job);
      } catch (err) {
        console.error("Error accepting job:", err);
      } finally {
        setAcceptLoading(false);
      }
    };

    return (
      <div className="border border-border rounded-lg p-4 hover:bg-muted/50 hover:border-accent/30 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-white">{job.service_title}</p>
            <p className="text-sm text-muted-foreground">{job.address}</p>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-muted-foreground">Scheduled Date</p>
            <p className="font-medium text-white">
              {job.scheduled_date
                ? format(new Date(job.scheduled_date), "MMM d, yyyy h:mm a")
                : "Not scheduled"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Amount</p>
            <p className="font-medium text-accent">
              {job.total_amount
                ? `${job.currency === "USD" ? "$" : "$"}${job.total_amount}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Rating</p>
            <p className="font-medium text-white">
              {job.rating ? `⭐ ${job.rating}` : "Pending"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-white border-border hover:text-accent hover:bg-accent/10"
          >
            View Details
          </Button>

          {/* Accept Booking Button */}
          {job.status === "pending" && !job.isBooked && (
            <Button
              size="sm"
              className="flex-1"
              variant="default"
              onClick={() => handleAcceptJob(job)}
              disabled={acceptLoading}
            >
              {acceptLoading ? "Accepting..." : "Accept Booking"}
            </Button>
          )}

          {/* Mark Complete Button */}
          {job.status === "accepted" && (
            <Button
              size="sm"
              className="flex-1"
              variant="default"
              onClick={() => handleCompleteJob(job.id)}
              disabled={completeLoading}
            >
              {completeLoading ? "Completing..." : "Mark Complete"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loadingBookings || loadingProviderBookings) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Loading bookings...
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome, {user?.fullName || "Provider"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your jobs and track your performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {providerBookings.length}
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
            <p className="text-3xl font-bold text-white">
              {
                providerBookings.filter(
                  (job) => job.status === "accepted" && job.isBooked
                ).length
              }
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
            <p className="text-3xl font-bold text-white">
              {completedJobs.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {/* ⭐ {user?.averageRating || 0} */}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>My Jobs</CardTitle>
          <CardDescription>Manage your service appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new">
                New Jobs (
                {
                  providerBookings.filter(
                    (job) => job.status === "pending" && !job.isBooked
                  ).length
                }
                )
              </TabsTrigger>

              <TabsTrigger value="accepted">
                Accepted (
                {
                  providerBookings.filter(
                    (job) => job.status === "accepted" && job.isBooked
                  ).length
                }
                )
              </TabsTrigger>

              <TabsTrigger value="completed">
                Completed ({completedJobs.length})
              </TabsTrigger>
            </TabsList>

            {/* New Jobs */}
            <TabsContent value="new" className="space-y-4 mt-4">
              {providerBookings.filter(
                (job) => job.status === "pending" && !job.isBooked
              ).length > 0 ? (
                providerBookings
                  .filter((job) => job.status === "pending" && !job.isBooked)
                  .map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No new jobs available
                </p>
              )}
            </TabsContent>

            {/* Accepted Jobs */}
            <TabsContent value="accepted" className="space-y-4 mt-4">
              {providerBookings.filter(
                (job) => job.status === "accepted" && job.isBooked
              ).length > 0 ? (
                providerBookings
                  .filter((job) => job.status === "accepted" && job.isBooked)
                  .map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No accepted jobs
                </p>
              )}
            </TabsContent>

            {/* Completed Jobs */}
            <TabsContent value="completed" className="space-y-4 mt-4">
              {completedJobs.length > 0 ? (
                completedJobs.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No completed jobs
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderDashboard;