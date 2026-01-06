import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useData } from '../../contexts/DataContext';
import { MessageSquare, MapPin, Calendar, DollarSign, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { updateBooking, getProviderBookings } from '../../api/AdminApi';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface JobUpdate {
  [key: string]: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

const JobsList = () => {
  const { updateJobStatus } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [providerJobs, setProviderJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<JobUpdate>({});
  const [processingJob, setProcessingJob] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          const res = await getProviderBookings(user.id);
          if (res.success) {
            const mappedJobs = res.data.map((b: any) => ({
              id: b.id,
              customerName: b.user_name || "Unknown Customer",
              address: b.address,
              date: new Date(b.scheduled_date),
              amount: b.total_amount,
              // Map backend 'accepted' to 'confirmed' for frontend consistency if needed
              status: b.isBooked && b.status === "pending" ? "confirmed" : (b.status === "accepted" ? "confirmed" : b.status),
              serviceId: b.service_id,
              notes: b.notes,
              rating: b.rating,
              review: b.review,
              providerId: b.provider_id
            }));
            setProviderJobs(mappedJobs);

            const initialStatuses: JobUpdate = {};
            mappedJobs.forEach((j: any) => {
              initialStatuses[j.id] = j.status;
            });
            setJobStatuses(initialStatuses);
          }
        } catch (err) {
          console.error("Failed to fetch jobs", err);
          toast.error("Failed to load jobs");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchJobs();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-[#FF7A00] text-white';
      case 'confirmed':
      case 'accepted':
        return 'bg-[#FF7A00] text-white';
      case 'in_progress':
        return 'bg-[#22C55E] text-white';
      case 'completed':
        return 'bg-[#A0A0A0] text-white';
      case 'cancelled':
        return 'bg-[#EF4444] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleJobAction = async (jobId: string, newStatus: 'confirmed' | 'in_progress' | 'completed') => {
    setProcessingJob(jobId);

    try {
      // Real Backend Update
      if (user && user.id) {
        try {
          // Map frontend 'confirmed' to backend 'accepted'
          const backendStatus = newStatus === 'confirmed' ? 'accepted' : newStatus;

          await updateBooking(jobId, {
            status: backendStatus,
            providerId: user.id
          });

          // If successful:
          setJobStatuses((prev) => ({
            ...prev,
            [jobId]: newStatus,
          }));

          updateJobStatus(jobId, newStatus);

          const statusText = newStatus === 'confirmed' ? 'accepted' : newStatus === 'in_progress' ? 'started' : 'completed';
          toast.success(`Job ${statusText} successfully`);

        } catch (apiError: any) {
          // Trap MP_REQUIRED error
          if (apiError.response?.status === 403 && apiError.response?.data?.code === 'MP_REQUIRED') {
            toast.error(apiError.response.data.message);
            navigate('/provider/profile');
            return; // Exit early
          }
          throw apiError; // Rethrow other errors
        }
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error('Failed to update job status');
    } finally {
      setProcessingJob(null);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    setProcessingJob(jobId);

    try {
      // Implement real rejection call if API supports it, otherwise mock timeout for now or use CancelBooking
      // Assuming updateBooking can handle 'cancelled' or similar
      await updateBooking(jobId, {
        status: 'cancelled',
        providerId: user?.id
      });

      setJobStatuses((prev) => ({
        ...prev,
        [jobId]: 'cancelled',
      }));

      updateJobStatus(jobId, 'cancelled');
      toast.success('Job rejected');
    } catch (error) {
      toast.error('Failed to reject job');
    } finally {
      setProcessingJob(null);
    }
  };

  const JobCard = ({ job }: { job: any }) => { // Relaxed type for now
    const isExpanded = expandedJob === job.id;
    const currentStatus = jobStatuses[job.id] || job.status;

    return (
      <div className="border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
        <div className="p-4 bg-card">
          <div className="flex items-start gap-4">
            <img src="https://avatar.vercel.sh/customer" alt="Customer" className="w-12 h-12 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-foreground">{job.customerName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {job.address}
                  </p>
                </div>
                <Badge className={getStatusColor(currentStatus)}>
                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                <div>
                  <p className="text-muted-foreground text-xs">Date & Time</p>
                  <p className="font-medium text-foreground">{format(new Date(job.date), 'MMM d, h:mm a')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Amount</p>
                  <p className="font-medium text-success">${job.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <StatusIcon status={currentStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          {currentStatus === 'pending' && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                size="sm"
                className="flex-1"
                disabled={processingJob === job.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJobAction(job.id, 'confirmed');
                }}
              >
                {processingJob === job.id ? 'Accepting...' : 'Accept Job'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                disabled={processingJob === job.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectJob(job.id);
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="border-t border-border p-4 bg-muted/30 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Customer Info</p>
                <p className="font-medium text-foreground mt-1">{job.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Service</p>
                <p className="font-medium text-foreground mt-1">
                  Service ID: {job.serviceId}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Full Address</p>
                <p className="font-medium text-foreground mt-1">{job.address}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Notes</p>
                <p className="font-medium text-foreground mt-1">{job.notes || 'No notes provided'}</p>
              </div>
            </div>

            {job.rating && (
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Customer Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="font-semibold">{job.rating}/5</span>
                  <span className="text-muted-foreground">- {job.review}</span>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4 flex gap-2">
              <Button className="flex-1" size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Customer
              </Button>
              {(currentStatus === 'confirmed' || currentStatus === 'accepted') && (
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  disabled={processingJob === job.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobAction(job.id, 'in_progress');
                  }}
                >
                  {processingJob === job.id ? 'Starting...' : 'Start Job'}
                </Button>
              )}
              {currentStatus === 'in_progress' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  disabled={processingJob === job.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobAction(job.id, 'completed');
                  }}
                >
                  {processingJob === job.id ? 'Completing...' : 'Mark Complete'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const pendingJobs = providerJobs.filter((j) => (jobStatuses[j.id] || j.status) === 'pending');
  const assignedJobs = providerJobs.filter((j) => {
    const s = jobStatuses[j.id] || j.status;
    return s === 'confirmed' || s === 'accepted';
  });
  const inProgressJobs = providerJobs.filter((j) => (jobStatuses[j.id] || j.status) === 'in_progress');
  const completedJobs = providerJobs.filter((j) => (jobStatuses[j.id] || j.status) === 'completed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Jobs</h1>
        <p className="text-muted-foreground mt-1">Manage your bookings and track job progress</p>
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({pendingJobs.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({assignedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressJobs.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingJobs.length > 0 ? (
              pendingJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No pending jobs</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4 mt-6">
            {assignedJobs.length > 0 ? (
              assignedJobs.map((job) => (
                <div key={job.id} onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                  <JobCard job={job} />
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No assigned jobs</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4 mt-6">
            {inProgressJobs.length > 0 ? (
              inProgressJobs.map((job) => (
                <div key={job.id} onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                  <JobCard job={job} />
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No jobs in progress</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedJobs.length > 0 ? (
              completedJobs.map((job) => (
                <div key={job.id} onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                  <JobCard job={job} />
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No completed jobs yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default JobsList;