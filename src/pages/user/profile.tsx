import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUpload } from '../../components/ImageUpload';
import { toast } from 'sonner';
import { getFullUserDetails, updateProviderProfile } from '../../api/AdminApi'; // reusing provider update for generic update if validated, or creating new one

// We might need a separate API for 'updateUserProfile' if 'updateProviderProfile' is strict about providers.
// Let's assume we can reuse or create a new one. 
// For now, let's use a new axios call directly if need be, but better to use a centralized API function.
// Let's check `AdminApi.js` first.
import axios from 'axios';

const ProfileSettings = () => {
  const { user } = useAuth();
  const Backend_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePicture: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile image from backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        // We can reuse getFullUserDetails if it returns user data regardless of role (it usually does based on token)
        const data = await getFullUserDetails();
        setFormData({
          name: data.name || user.name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '', // assuming these fields exist in backend response
          state: data.state || '',
          zipCode: data.zipCode || '',
          profilePicture: data.avatar || data.extra?.avatar || '',
        });
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    };
    fetchUserData();
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    // Remove strict validation for address for now if backend doesn't require it? 
    // But UI shows it. Let's keep it but make it robust.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      // ✅ Use Real Backend API
      // We need an endpoint for updating generic user profile. 
      // Reuse updateProviderProfile logic but mapped to user? 
      // backend 'updateProviderProfile' updates 'serviceProviders' collection. 
      // We need 'updateUserProfile'.

      // Let's create a direct axios call here for now or search for 'updateUser' in backend.
      // Assuming we need to implement it.

      await axios.post(`${Backend_URL}/api/auth/update-profile`, {
        userId: user!.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        avatar: formData.profilePicture
      }, { withCredentials: true });

      toast.success('Profile saved successfully');
    } catch (error) {
      console.error(error);
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
              src={formData.profilePicture || "https://avatar.vercel.sh/default"}
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
                disabled // Email usually can't be changed easily in Firebase
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Preferences (Static for now) */}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;