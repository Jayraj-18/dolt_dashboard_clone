import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockProducts } from '../../lib/mockData';
import { ShoppingCart, Star, Search, Filter, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Marketplace = () => {
  const { cartItems, addToCart, removeFromCart, updateCartQuantity } = useData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...new Set(mockProducts.map((p) => p.category))];

  const filteredProducts = mockProducts.filter((product) => {
    const categoryMatch = !selectedCategory || selectedCategory === 'All' || product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const handleAddToCart = (productId: string, price: number) => {
    addToCart(productId, 1, price);
    const product = mockProducts.find((p) => p.id === productId);
    toast.success(`Added ${product?.name} to cart`);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId);
    const product = mockProducts.find((p) => p.id === productId);
    toast.success(`Removed ${product?.name} from cart`);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Marketplace</h1>
          <p className="text-muted-foreground mt-1">Browse and purchase quality products and accessories</p>
        </div>
        {cartCount > 0 && (
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-medium">Cart</p>
                <p className="text-2xl font-bold">{cartCount} items</p>
                <p className="text-lg font-semibold mt-1">${cartTotal.toFixed(2)}</p>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  variant="secondary"
                  onClick={() => navigate('/user/cart')}
                >
                  Go to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat || (cat === 'All' && !selectedCategory) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const cartItem = cartItems.find((item) => item.productId === product.id);

          return (
            <Card key={product.id} className="flex flex-col hover:shadow-lg transition-all overflow-hidden">
              <div className="h-48 bg-muted overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <CardContent className="flex-1 flex flex-col p-4 space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="text-sm font-semibold">{product.rating}</span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-border">
                  <p className="text-xl font-bold text-foreground">${product.price}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.stock > 5 ? `${product.stock} in stock` : `Only ${product.stock} left`}
                  </p>
                </div>

                <div className="flex gap-2 mt-auto">
                  {cartItem ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-2"
                        onClick={() => handleQuantityChange(product.id, cartItem.quantity - 1)}
                      >
                        −
                      </Button>
                      <span className="flex-1 text-center text-sm font-semibold">{cartItem.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-2"
                        onClick={() => handleQuantityChange(product.id, cartItem.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleRemoveFromCart(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button className="flex-1" size="sm" onClick={() => handleAddToCart(product.id, product.price)}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No products found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Marketplace;