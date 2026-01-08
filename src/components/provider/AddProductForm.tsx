import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createProduct } from "../../api/products";
import { useAuth } from "../../contexts/AuthContext";
import { ImageUpload } from "../ImageUpload";

interface AddProductFormProps {
    onProductAdded: () => void;
}

export function AddProductForm({ onProductAdded }: AddProductFormProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: "",
        description: "",
        rating: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (imageData: string) => {
        setFormData((prev) => ({ ...prev, image: imageData }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        // Validation
        if (!formData.name || !formData.price || !formData.stock || !formData.category || !formData.description || !formData.image) {
            toast.error("All fields (including image and description) are compulsory.");
            return;
        }

        setLoading(true);
        try {
            await createProduct({
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                providerId: user.id,
                providerName: user.fullName || user.name || "Unknown Provider",
            });
            toast.success("Product added successfully");
            setOpen(false);
            setFormData({
                name: "",
                price: "",
                category: "",
                stock: "",
                image: "",
                description: "",
                rating: 0,
            });
            onProductAdded();
        } catch (error: any) {
            toast.error(error.message || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Enter the details of the product you want to sell.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., Wireless Earbuds"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($) *</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock *</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                placeholder="0"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input
                            id="category"
                            name="category"
                            placeholder="e.g., Electronics"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Product Image *</Label>
                        <ImageUpload
                            currentImage={formData.image}
                            onImageChange={handleImageChange}
                            maxSize={5}
                            acceptedFormats={["jpg", "jpeg", "png", "webp"]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Product details..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
