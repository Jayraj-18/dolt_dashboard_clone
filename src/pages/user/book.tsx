import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { mockProviders } from "../../lib/mockData";
import { Search, Filter, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAllServices } from "../../api/ServiceApi.js";

// Types
interface FormData {
  date: string;
  time: string;
  address: string;
  notes: string;
  fullName?: string;
}

interface FormErrors {
  date?: string;
  time?: string;
  address?: string;
}

const BookService = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    date: "",
    time: "",
    address: "",
    notes: "",
  });

const getMinTime = () => {
  if (!formData.date) return "";

  const today = new Date();
  const selectedDate = new Date(formData.date);

  if (selectedDate.toDateString() === today.toDateString()) {
    // Format current time as HH:MM
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return "00:00";
};

const handleTimeChange = (time: string) => {
  if (time < getMinTime()) {
    alert("Select a valid time");
    return;
  }
  handleFormChange("time", time);
};



  const [services, setServices] = useState([]);

  // ✅ REPLACED mockServices → services
  const categories = ["all", ...new Set(services.map((s) => s.category))];

  // ✅ REPLACED mockServices → services
  const filteredServices = services.filter((service) => {
    const categoryMatch =
      selectedCategory === "all" || service.category === selectedCategory;
    const searchMatch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const topProviders = mockProviders.slice(0, 5);

  // ✅ REPLACED mockServices → services
  const selectedServiceData = selectedService
    ? services.find((s) => s.id === selectedService)
    : null;

  const BACKEND_URL =
    import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://api.d0lt.local:5000";

  // Validate Form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.address.trim())
      newErrors.address = "Service address is required";
    if (formData.address.length < 5)
      newErrors.address = "Address must be at least 5 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Booking Function
  const handleBookService = async () => {
    if (!validateForm() || !selectedServiceData) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = `${BACKEND_URL}/api/bookings/createBooking`;

      const bookingData = {
        user_id: user.id,
        service_id: selectedServiceData.id,
        service_title: selectedServiceData.name,
        service_description: selectedServiceData.description,
        scheduled_date: `${formData.date}T${formData.time}:00`,
        address: formData.address,
        notes: formData.notes,
        total_amount: selectedServiceData.basePrice,
        currency: "USD",
        user_name: user.fullName,
        user_email: user.email,
      };

      const response = await axios.post(API_URL, bookingData);

      if (response.status === 201) {
        toast.success("✅ Booking created successfully!");
        setSelectedService(null);
        setFormData({ date: "", time: "", address: "", notes: "" });
        setErrors({});
        // Redirect to payment page instead of bookings list
        const bookingId = response.data.booking?.bookingId || response.data.booking?.id;
        if (bookingId) {
          window.location.href = `/user/payment/${bookingId}`;
        } else {
          console.error("Booking ID not found in response", response.data);
          window.location.href = "/user/bookings";
        }
      } else {
        toast.error(response.data.message || "Failed to create booking");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message || "Server error while creating booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data);
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book a Service</h1>
        <p className="text-muted-foreground mt-1">
          Find and book professional services in your area
        </p>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 w-full h-auto gap-2 p-2 bg-transparent">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="capitalize text-xs"
                >
                  {cat === "all" ? "All Services" : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card
            key={service.id}
            className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
            onClick={() => setSelectedService(service.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{service.icon}</span>
                    <Badge variant="secondary" className="capitalize">
                      {service.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Starting at</p>
                  <p className="text-xl font-bold text-foreground">
                    ${service.basePrice}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-semibold text-sm">
                      {service.rating}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {service.reviewCount} reviews
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedService(service.id);
                }}
                variant={selectedService === service.id ? "default" : "outline"}
              >
                {selectedService === service.id ? "Selected" : "Book Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Detail Form */}
      {selectedService && selectedServiceData && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedServiceData.icon}</span>
              {selectedServiceData.name}
            </CardTitle>
            <CardDescription>
              Complete the booking details below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className={errors.date ? "border-destructive" : ""}
                   min={new Date().toISOString().split("T")[0]}

                />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                 min={getMinTime()}
          onChange={(e) => handleTimeChange(e.target.value)}
                  className={errors.time ? "border-destructive" : ""}
                />
                {errors.time && (
                  <p className="text-xs text-destructive">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Service Address *</Label>
              <Input
                id="address"
                placeholder="123 Main St, New York"
                value={formData.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                placeholder="Any special requests..."
                value={formData.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-card text-foreground"
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Service Summary
              </p>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Service:</span>
                  <span className="font-medium">
                    {selectedServiceData.name}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span className="font-medium">
                    ${selectedServiceData.basePrice}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span className="font-medium">{formData.date || "-"}</span>
                </div>

                <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-primary">
                    ${selectedServiceData.basePrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleBookService}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedService(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookService;
