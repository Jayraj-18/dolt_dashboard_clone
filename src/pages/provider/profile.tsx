import { useState, useEffect } from "react";
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
import { Badge } from "../../components/ui/badge";
import { ImageUpload } from "../../components/ImageUpload";
import { MapPin, Award, DollarSign, Star, Save, X, CreditCard, CheckCircle, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFullUserDetails,
  updateProviderProfile,
} from "../../api/AdminApi.js";
import { AddProductForm } from "../../components/provider/AddProductForm";
import { getProducts, deleteProduct, ProductData } from "../../api/products";


interface ProviderExtra {
  hourlyRate?: number;
  skills?: string[];
  serviceAreas?: string[];
  avatar?: string;
  averageRating?: number;
}

interface ProviderData {
  id?: string;
  name: string;
  email: string;
  createdAt?: { _seconds?: number; _nanoseconds?: number };
  completedBookings?: number;
  extra?: ProviderExtra;
}

interface FormData {
  name: string;
  email: string;
  hourlyRate: number;
  skills: string[];
  serviceAreas: string[];
  avatar: string;
  userId: string;
}


const ProviderProfile = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connecting, setConnecting] = useState(false); // MP Connection State
  const [userdata, setUserdata] = useState<ProviderData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hourlyRate: 0,
    skills: [],
    serviceAreas: [],
    avatar: "",
    userId: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newArea, setNewArea] = useState("");
  const [errors, setErrors] = useState<any>({});

  // Fetch user profile exactly once
  // Remove updateProviderProfile from useEffect dependency
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getFullUserDetails();
        setUserdata(data);

        setFormData({
          name: data.name || "",
          email: data.email || "",
          hourlyRate: data.extra?.hourlyRate || 0, // ✅ Get from extra
          skills: data.extra?.skills || [],
          serviceAreas: data.extra?.serviceAreas || [],
          serviceAreas: data.extra?.serviceAreas || [],
          avatar: data.avatar || data.extra?.avatar || "",
          userId: user.id,
        });
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };
    fetch();

    if (user?.id) {
      fetchProducts();
    }
  }, []); // ✅ Empty dependency array - fetch only once on mount

  const fetchProducts = async () => {
    try {
      if (user?.id) {
        const response = await getProducts(user.id);
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Name is optional — remove validation
    // if (!formData.name.trim()) newErrors.name = "Name is required";

    // Email is optional, but if entered → must be valid
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format";
    }

    // Hourly Rate optional — only validate if filled
    if (formData.hourlyRate && formData.hourlyRate <= 0) {
      newErrors.hourlyRate = "Hourly rate must be greater than 0";
    }

    // Skills optional — remove validation
    // if (!formData.skills || formData.skills.length === 0)
    //   newErrors.skills = "Add at least one skill";

    // Service areas optional — remove validation
    // if (!formData.serviceAreas || formData.serviceAreas.length === 0)
    //   newErrors.serviceAreas = "Add at least one service area";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const handleImageChange = (imageData: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: imageData,
    }));
  };

  const addSkill = () => {
    if (newSkill && !(formData.skills as string[]).includes(newSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills as string[]), newSkill],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills as string[]).filter((s) => s !== skill),
    }));
  };

  const addServiceArea = () => {
    if (newArea && !(formData.serviceAreas as string[]).includes(newArea)) {
      setFormData((prev) => ({
        ...prev,
        serviceAreas: [...(prev.serviceAreas as string[]), newArea],
      }));
      setNewArea("");
    }
  };

  const removeServiceArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: (prev.serviceAreas as string[]).filter((a) => a !== area),
    }));
  };

  // Mercado Pago Connection Handler
  const handleConnectMercadoPago = async () => {
    try {
      setConnecting(true);

      // Get Auth URL from backend
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/payments/oauth/authorize?providerId=${user.id}`
      );

      if (!response.ok) {
        throw new Error("Error generating AUTH URL");
      }

      const data = await response.json();

      if (!data.success || !data.data?.authUrl) {
        throw new Error(data.message || "Failed to get auth URL");
      }

      // redirect to MercadoPago for auth
      window.location.href = data.data.authUrl;
    } catch (err: any) {
      console.error("Error connecting Mercado Pago:", err);
      toast.error(err.message);
      setConnecting(false);
    }
  };

  const handleSave = async () => {

    if (!validateForm()) {
      toast.error("Please fix all errors before saving");

      return;
    }

    setIsSaving(true);

    try {

      const res = await updateProviderProfile(formData);


      // ✅ Fetch fresh data from backend after successful update
      const updatedData = await getFullUserDetails();
      setUserdata(updatedData);

      // ✅ Update formData with fresh data
      setFormData({
        name: updatedData.name || "",
        email: updatedData.email || "",
        hourlyRate: updatedData.extra?.hourlyRate || 0,
        skills: updatedData.extra?.skills || [],
        serviceAreas: updatedData.extra?.serviceAreas || [],
        avatar: updatedData.extra?.avatar || "",
        userId: user.id,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!userdata) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile Management</h1>
        <p className="text-muted-foreground mt-1">
          Update your professional information and expertise
        </p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <img
              src={formData.avatar}
              alt={formData.name}
              className="w-24 h-24 rounded-full object-cover"
            />

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{userdata.name}</h2>
                  <p className="text-muted-foreground">{userdata.email}</p>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "destructive" : "default"}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold">
                      {userdata.extra?.averageRating ?? "—"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Jobs Completed
                  </p>
                  <p className="font-semibold text-lg">
                    {userdata.completedBookings ?? 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-semibold">
                    {userdata.createdAt
                      ? new Date(
                        userdata.createdAt._seconds! * 1000
                      ).getFullYear()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Picture */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a new profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              currentImage={formData.avatar}
              onImageChange={handleImageChange}
              maxSize={5}
              acceptedFormats={["jpg", "jpeg", "png", "gif", "webp"]}
            />
          </CardContent>
        </Card>
      )}

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            Update your rates and certifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hourly Rate ($) *</Label>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    handleInputChange(
                      "hourlyRate",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Full Name
                  </p>
                  <p className="font-semibold">{formData.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Email Address
                  </p>
                  <p className="font-semibold">{formData.email}</p>
                </div>
              </div>

              {/* In the Professional Information display section */}
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <DollarSign className="w-5 h-5" />
                <div>
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="text-2xl font-bold">
                    ${userdata.extra?.hourlyRate || (userdata as any).hourlyRate || 0}/hr
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" /> Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add a new skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
              />
              <Button onClick={addSkill}>Add</Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {formData.skills && formData.skills.length > 0 ? (
              (formData.skills as string[]).map((skill) => (
                <Badge
                  key={skill}
                  className="bg-primary text-primary-foreground py-1 px-3 text-sm flex items-center gap-2"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:opacity-75 transition-opacity"
                      type="button"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? "No skills added yet. Add your first skill above."
                  : "No skills listed"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Service Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add a service area..."
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addServiceArea()}
              />
              <Button onClick={addServiceArea}>Add</Button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(formData.serviceAreas as string[]).map((area) => (
              <div
                key={area}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{area}</span>
                {isEditing && (
                  <button
                    onClick={() => removeServiceArea(area)}
                    className="text-destructive"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Products Section - ADDED */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> My Products
              </CardTitle>
              <CardDescription>
                Manage the products you are selling
              </CardDescription>
            </div>
            <AddProductForm onProductAdded={fetchProducts} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No products listing. Add one above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product._id} className="border rounded-lg p-4 flex gap-4 relative group">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate" title={product.name}>{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold">${product.price}</span>
                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => product._id && handleDeleteProduct(product._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mercado Pago Integration - ADDED SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Integration
          </CardTitle>
          <CardDescription>
            Connect your Mercado Pago account to receive payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(userdata.extra as any)?.mp_account?.mp_connected ? (
            <div className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="w-24 h-24 text-[#FF7A00]" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#FF7A00] rounded-full">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-[#FF7A00]">Mercado Pago Connected</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Your account is successfully linked. You can now accept bookings and receive payments directly.
                </p>
                <div className="flex items-center gap-2 text-sm bg-white/50 w-fit px-3 py-1.5 rounded-full border border-[#FF7A00]/20">
                  <span className="text-[#FF7A00] font-semibold">Account ID:</span>
                  <span className="font-mono text-foreground">{(userdata.extra as any)?.mp_account?.mp_user_id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Connect Mercado Pago</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Link your account to receive payments directly for your services.
              </p>
              <Button
                onClick={handleConnectMercadoPago}
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect Account"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Buttons */}
      {isEditing && (
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;

