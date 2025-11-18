import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Label } from "../../components/ui/label";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";
import {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../../api/ProductApi";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    rating: "",
    description: "",
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    getData();
  }, []);

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

 const handleAddProduct = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      rating: Number(newProduct.rating),
    };

    if (editingProduct) {
      // 🟡 Update product
      await updateProduct(editingProduct._id, payload);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === editingProduct._id ? { ...p, ...payload } : p
        )
      );
      alert("Product updated successfully!");
    } else {
      // 🟢 Add new product
      const res = await addProduct(payload);
      setProducts((prev) => [...prev, { _id: res.id, ...payload }]);
      alert("Product added successfully!");
    }

    // Reset form
    setShowAddForm(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      rating: "",
      description: "",
    });
  } catch (error) {
    console.error("Error saving product:", error);
    alert("Failed to save product");
  }
};


  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter((p) => p.stock < 20);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="relative space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-gray-500 mt-1">Manage inventory and listings</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{products.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {lowStockProducts.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell
                        className={
                          product.stock < 20 ? "text-red-500 font-semibold" : ""
                        }
                      >
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        ${(product.price * product.stock).toLocaleString()}
                      </TableCell>
                      <TableCell>⭐ {product.rating}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.stock > 20
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }
                        >
                          {product.stock > 20 ? "In Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingProduct(product);
                              setNewProduct({
                                name: product.name || "",
                                category: product.category || "",
                                price: product.price || "",
                                stock: product.stock || "",
                                image: product.image || "",
                                rating: product.rating || "",
                                description: product.description || "",
                              });
                              setShowAddForm(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 🟢 Slide-In Add Product Panel */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full sm:w-[420px] h-full shadow-xl p-6 animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingProduct
                  ? `Edit Product: ${editingProduct.name}`
                  : "Add New Product"}
              </h2>
           <Button
  variant="ghost"
  size="icon"
  className="bg-black"
  onClick={() => {
    setShowAddForm(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      rating: "",
      description: "",
    });
  }}
>
  <X className="w-5 h-5" />
</Button>

            </div>

            {/* Form */}
            <form onSubmit={handleAddProduct} className="space-y-4">
              <Input
                placeholder="Product Name"
                required
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <Input
                placeholder="Category"
                required
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Price"
                required
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Stock"
                required
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />
              <Input
                placeholder="Image URL  (optional)"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
              />
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="Rating (optional)"
                value={newProduct.rating}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, rating: e.target.value })
                }
              />
              <Input
                placeholder="Description (optional)"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
              />

              <Button type="submit" className="w-full">
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
