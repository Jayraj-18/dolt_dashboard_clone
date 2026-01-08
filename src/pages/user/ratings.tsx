import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockBookings } from '../../lib/mockData';
import { Star, MessageCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const Ratings = () => {
  const userBookings = mockBookings.filter((b) => b.userId === 'user_1');
  const completedBookings = userBookings.filter((b) => b.status === 'completed');

  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const ratedBookings = completedBookings.filter((b) => b.rating);
  const unratedBookings = completedBookings.filter((b) => !b.rating);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ratings & Reviews</h1>
        <p className="text-muted-foreground mt-1">Rate your service experiences and read reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {(ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / Math.max(ratedBookings.length, 1)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{ratedBookings.length} ratings given</p>
              </div>
              <Star className="w-8 h-8 text-warning/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reviews Written</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{ratedBookings.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Services rated</p>
              </div>
              <MessageCircle className="w-8 h-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-warning">{unratedBookings.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting your feedback</p>
              </div>
              <Star className="w-8 h-8 text-warning/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      {unratedBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Leave a Rating</h2>
          <div className="space-y-4">
            {unratedBookings.map((booking) => (
              <Card key={booking.id} className="border-warning/50 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-foreground">{booking.providerName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.serviceId === 'svc_1' ? 'General Cleaning' : 'Pipe Repair'} • {format(booking.completedAt || new Date(), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">Pending Rating</Badge>
                  </div>

                  {expandedReview === booking.id ? (
                    <div className="space-y-4 border-t border-border pt-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          How would you rate this service?
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setSelectedRating(star)}
                              className={`text-3xl transition-colors ${
                                star <= selectedRating ? 'text-warning' : 'text-muted-foreground'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Write a review (optional)
                        </label>
                        <textarea
                          placeholder="Share your experience with this service..."
                          className="w-full p-3 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground resize-none"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1">Submit Rating</Button>
                        <Button variant="outline" onClick={() => setExpandedReview(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setExpandedReview(booking.id)}
                    >
                      Rate This Service
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Reviews */}
      {ratedBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Your Reviews</h2>
          <div className="space-y-4">
            {ratedBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{booking.providerName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.serviceId === 'svc_1' ? 'General Cleaning' : 'Pipe Repair'} • {format(booking.completedAt || new Date(), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (booking.rating || 0)
                            ? 'fill-warning text-warning'
                            : 'fill-muted text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  {booking.review && (
                    <p className="text-foreground text-sm">{booking.review}</p>
                  )}

                  {/* Edit Button */}
                  <Button variant="outline" size="sm" className="mt-4">
                    Edit Review
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedBookings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No completed services yet</p>
            <p className="text-sm text-muted-foreground">When you complete a service booking, you'll be able to leave a rating and review here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Ratings;
