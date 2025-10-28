import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUpload } from '../../components/ImageUpload';
import { User, Mail, Phone, MapPin, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    profilePicture: 'https://avatar.vercel.sh/john',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile image from localStorage on mount
  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: savedImage,
      }));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!/^\+?[0-9\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (imageData: string) => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: imageData,
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix all errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(formData));
      toast.success('Profile saved successfully');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Upload a new profile picture or connect your Google account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <img
              src={formData.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-border object-cover"
            />
          </div>
          <ImageUpload
            currentImage={formData.profilePicture}
            onImageChange={handleImageChange}
            maxSize={5}
            acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp']}
          />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? 'border-destructive' : ''}
              />
              {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={errors.zipCode ? 'border-destructive' : ''}
              />
              {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode}</p>}
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive booking and payment updates</p>
            </div>
            <Badge>Enabled</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Get alerts on your phone</p>
            </div>
            <Badge variant="outline">Disabled</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">Receive offers and promotions</p>
            </div>
            <Badge>Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
            Change Password
          </Button>
          <Button variant="destructive">
            Deactivate Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;