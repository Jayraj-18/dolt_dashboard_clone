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
import { MapPin, Award, DollarSign, Star, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFullUserDetails,
  updateProviderProfile,
} from "../../api/AdminApi.js";


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
  const [userdata, setUserdata] = useState(null);

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
  const [errors, setErrors] = useState({});

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
          avatar: data.extra?.avatar || "",
          userId: user.id,
        });
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };
    fetch();
  }, []); // ✅ Empty dependency array - fetch only once on mount

  const validateForm = () => {
    const newErrors = {};

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageChange = (imageData) => {
    setFormData((prev) => ({
      ...prev,
      avatar: imageData,
    }));
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addServiceArea = () => {
    if (newArea && !formData.serviceAreas.includes(newArea)) {
      setFormData((prev) => ({
        ...prev,
        serviceAreas: [...prev.serviceAreas, newArea],
      }));
      setNewArea("");
    }
  };

  const removeServiceArea = (area) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((a) => a !== area),
    }));
  };

  const handleSave = async () => {
    // console.log("Saving form data:", formData);
    if (!validateForm()) {
      toast.error("Please fix all errors before saving");
      // console.log("Validation errors:", errors);
      return;
    }

    setIsSaving(true);

    try {
      // console.log(formData);
      const res = await updateProviderProfile(formData);
      // console.log("Update response:", res);

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
                          userdata.createdAt._seconds * 1000
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
                    ${userdata.extra?.hourlyRate || userdata.hourlyRate || 0}/hr
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
              formData.skills.map((skill) => (
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
            {formData.serviceAreas.map((area) => (
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
