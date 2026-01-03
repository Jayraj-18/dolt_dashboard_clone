// src/types/booking.ts

export interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  provider_id: string;
  service_id: string;
  service_title: string;
  service_description: string;
  total_amount: number;
  currency: string;
  scheduled_date: string;
  address: string;
  notes: string;
  latitude?: number | null;
  longitude?: number | null;
  status: "pending" | "accepted" | "completed" | "cancelled";
  isBooked: boolean;
  isCancelled: boolean;
  created_at?: string;
  updated_at?: string;
  completed_date?: string | null;
  totalBookings?: number;

  // Rating & Issue Fields
  rating?: number;
  review?: string;
  hasIssue?: boolean;
  issueDetails?: {
    reason: string;
    description: string;
    reportedAt: string;
  };
}
