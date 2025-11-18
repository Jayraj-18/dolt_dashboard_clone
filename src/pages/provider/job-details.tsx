import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockBookings } from '../../lib/mockData';
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';


interface Job {
  id: string;
  status: string;
  customerName: string;
  address: string;
  date: Date;
  time: string;
  amount: number;
  notes?: string;
  rating?: number;
  review?: string;
}

const JobDetails = () => { const navigate = useNavigate();
  // Get first in-progress or confirmed job
const job: Job =
  mockBookings.find((b: Job) =>
    ['in_progress', 'confirmed'].includes(b.status)
  ) || mockBookings[0];
  const [jobStatus, setJobStatus] = useState(job.status);

  const handleStatusChange = (newStatus: string) => {
    setJobStatus(newStatus);
    // console.log(`Job status updated to: ${newStatus}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/provider/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <h1 className="text-3xl font-bold text-foreground mt-4">Job Details</h1>
        <p className="text-muted-foreground mt-1">ID: {job.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Job Status</CardTitle>
                <Badge className={`bg-[#FF7A00] text-white`}>
                  {jobStatus.charAt(0).toUpperCase() + jobStatus.slice(1).replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {jobStatus !== 'confirmed' && jobStatus !== 'in_progress' && (
                  <Button onClick={() => handleStatusChange('confirmed')} variant="outline">
                    Accept Job
                  </Button>
                )}
                {jobStatus === 'confirmed' && (
                  <Button onClick={() => handleStatusChange('in_progress')} className="flex-1">
                    Start Work
                  </Button>
                )}
                {jobStatus === 'in_progress' && (
                  <Button onClick={() => handleStatusChange('completed')} className="flex-1" variant="outline">
                    Mark Complete
                  </Button>
                )}
                <Button variant="outline">Reschedule</Button>
                <Button variant="destructive" size="sm">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src="https://avatar.vercel.sh/customer"
                  alt={job.customerName}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="font-semibold text-foreground">{job.customerName}</p>
                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">customer@example.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{job.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{format(job.date, 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{job.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium text-foreground">${job.amount}</p>
                  </div>
                </div>
              </div>

              {job.notes && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-foreground mt-2">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                <div className="text-sm">
                  <p className="text-muted-foreground">Customer - 2 hours ago</p>
                  <p className="text-foreground mt-1">When can you arrive tomorrow? Is 10 AM possible?</p>
                </div>
                <div className="text-sm mt-4">
                  <p className="text-muted-foreground">You - 1 hour ago</p>
                  <p className="text-foreground mt-1">Yes, 10 AM works perfectly. I'll be there on time!</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-foreground"
                />
                <Button>Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Customer
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button className="w-full" variant="outline">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
              <Button className="w-full" variant="destructive">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Job Amount</p>
                <p className="text-2xl font-bold text-foreground">${job.amount}</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge className="mt-2 bg-[#22C55E] text-white">
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Customer Rating */}
          {job.rating && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500">⭐ {job.rating}</p>
                <p className="text-sm text-muted-foreground mt-2">{job.review}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;