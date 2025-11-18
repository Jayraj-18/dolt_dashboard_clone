import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import {
  addService,
  getAllServices,
  updateService,
  deleteService,
} from "../../api/ServiceApi.js";

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 set to false so UI loads immediately
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [newService, setNewService] = useState({
    name: "",
    category: "",
    basePrice: "",
    description: "",
    icon: "",
    rating: "",
    reviewCount: "",
  });

  const filteredServices = services.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveService = async () => {
    if (
      !newService.name ||
      !newService.category ||
      !newService.basePrice ||
      !newService.description
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (editingService) {
        // ✅ EDIT MODE
        const updated = await updateService(editingService.id, {
          ...newService,
          basePrice: parseFloat(newService.basePrice),
          rating: newService.rating ? parseFloat(newService.rating) : 0,
          reviewCount: newService.reviewCount
            ? parseInt(newService.reviewCount)
            : 0,
        });

        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? updated : s))
        );
        alert("✅ Service updated successfully!");
      } else {
        // ✅ ADD MODE
        const addedService = await addService({
          name: newService.name.trim(),
          category: newService.category.trim(),
          basePrice: parseFloat(newService.basePrice),
          description: newService.description.trim(),
          icon: newService.icon?.trim() || undefined,
          rating: newService.rating ? parseFloat(newService.rating) : undefined,
          reviewCount: newService.reviewCount
            ? parseInt(newService.reviewCount)
            : undefined,
        });

        setServices((prev) => [...prev, addedService]);
        alert("✅ Service added successfully!");
      }

      // ✅ Reset form after saving
      setNewService({
        name: "",
        category: "",
        basePrice: "",
        description: "",
        icon: "",
        rating: "",
        reviewCount: "",
      });
      setEditingService(null);
      setShowAddForm(false);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save service.";
      alert(message);
      console.error("Error saving service:", error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Services Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all available services on the platform
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {services.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {categories.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {services.length
                ? (
                    services.reduce((sum, s) => sum + (s.rating || 0), 0) /
                    services.length
                  ).toFixed(1)
                : "0.0"}
              ★
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>
              {editingService
                ? `Edit Service: ${editingService.name}`
                : "Add New Service"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Painting"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Home Maintenance"
                  value={newService.category}
                  onChange={(e) =>
                    setNewService({ ...newService, category: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Base Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={newService.basePrice}
                  onChange={(e) =>
                    setNewService({ ...newService, basePrice: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  placeholder="Service description"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* 🟡 New Optional Fields Below */}
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  placeholder="e.g., 🔧 or FaTools"
                  value={newService.icon || ""}
                  onChange={(e) =>
                    setNewService({ ...newService, icon: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (optional)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="e.g., 4.5"
                  value={newService.rating || ""}
                  onChange={(e) =>
                    setNewService({ ...newService, rating: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewCount">Review Count (optional)</Label>
                <Input
                  id="reviewCount"
                  type="number"
                  placeholder="e.g., 120"
                  value={newService.reviewCount || ""}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      reviewCount: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveService}>
                {editingService ? "Update Service" : "Create Service"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingService(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                         <span className="text-lg">{service.icon || '📦'}</span> 
                          <span className="font-medium text-foreground">
                            {service.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{service.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        ${service.basePrice}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ⭐ {service.rating || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {service.reviewCount || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingService(service); // store the selected service
                              setShowAddForm(true); // open the same form
                              setNewService({
                                name: service.name || "",
                                category: service.category || "",
                                basePrice: service.basePrice?.toString() || "",
                                description: service.description || "",
                                icon: service.icon || "",
                                rating: service.rating?.toString() || "",
                                reviewCount:
                                  service.reviewCount?.toString() || "",
                              });
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No services found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServicesManagement;
