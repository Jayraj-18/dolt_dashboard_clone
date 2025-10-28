import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { mockServices, mockProviders } from '../../lib/mockData';
import { Search, Filter, MapPin, Clock, User, DollarSign, Star, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';

const BookService = () => {
  const { addBooking } = useData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    notes: '',
  });

  const categories = ['all', ...new Set(mockServices.map((s) => s.category))];

  const filteredServices = mockServices.filter((service) => {
    const categoryMatch = selectedCategory === 'all' || service.category === selectedCategory;
    const searchMatch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const topProviders = mockProviders.slice(0, 5);
  const selectedServiceData = selectedService ? mockServices.find((s) => s.id === selectedService) : null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.address.trim()) newErrors.address = 'Service address is required';
    if (formData.address.length < 5) newErrors.address = 'Address must be at least 5 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: string, value: string) => {
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

  const handleBookService = async () => {
    if (!validateForm() || !selectedServiceData) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Add booking to context
      addBooking({
        id: `book_${Date.now()}`,
        serviceId: selectedServiceData.id,
        serviceName: selectedServiceData.name,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        notes: formData.notes,
        status: 'pending',
        createdAt: new Date(),
      });

      toast.success('Service booking request created! Awaiting provider confirmation.', {
        description: `Booking ID: book_${Date.now()}`,
      });

      // Reset form
      setSelectedService(null);
      setFormData({ date: '', time: '', address: '', notes: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book a Service</h1>
        <p className="text-muted-foreground mt-1">Find and book professional services in your area</p>
      </div>

      {/* Search and Filter */}
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

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 w-full h-auto gap-2 p-2 bg-transparent">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="capitalize text-xs"
                >
                  {cat === 'all' ? 'All Services' : cat}
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
              <p className="text-sm text-muted-foreground">{service.description}</p>
              
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Starting at</p>
                  <p className="text-xl font-bold text-foreground">${service.basePrice}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-semibold text-sm">{service.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.reviewCount} reviews</p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedService(service.id);
                }}
                variant={selectedService === service.id ? 'default' : 'outline'}
              >
                {selectedService === service.id ? 'Selected' : 'Book Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Top-Rated Providers</CardTitle>
          <CardDescription>Book services from our best-reviewed professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProviders.map((provider) => (
              <div
                key={provider.id}
                className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer hover:shadow-md"
              >
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-12 h-12 rounded-full mb-3 object-cover"
                />
                <h3 className="font-semibold text-foreground text-sm">{provider.name}</h3>
                <div className="flex items-center gap-1 my-2">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span className="text-xs font-semibold">{provider.rating}</span>
                  <span className="text-xs text-muted-foreground">({provider.completedJobs} jobs)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {provider.skills.slice(0, 2).join(', ')}
                </p>
                <Button size="sm" className="w-full" variant="outline">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Detail Form */}
      {selectedService && selectedServiceData && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedServiceData.icon}</span>
              {selectedServiceData.name}
            </CardTitle>
            <CardDescription>Complete the booking details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className={errors.date ? 'border-destructive' : ''}
                />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleFormChange('time', e.target.value)}
                  className={errors.time ? 'border-destructive' : ''}
                />
                {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Service Address *</Label>
              <Input
                id="address"
                placeholder="123 Main St, New York, NY 10001"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                placeholder="Any special requests or details..."
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-card text-foreground"
                rows={3}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Service Summary</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Service:</span>
                  <span className="font-medium">{selectedServiceData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span className="font-medium">${selectedServiceData.basePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date:</span>
                  <span className="font-medium">{formData.date || '-'}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-primary">${selectedServiceData.basePrice}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleBookService}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
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