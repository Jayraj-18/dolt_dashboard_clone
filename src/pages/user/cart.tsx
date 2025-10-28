import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { mockProducts } from '../../lib/mockData';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart } = useData();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    email: '',
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const getProduct = (id: string) => mockProducts.find((p) => p.id === id);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const validateCheckoutForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!checkoutData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!checkoutData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!checkoutData.address.trim()) newErrors.address = 'Address is required';
    if (!checkoutData.city.trim()) newErrors.city = 'City is required';
    if (!checkoutData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckoutChange = (field: string, value: string) => {
    setCheckoutData((prev) => ({
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

  const handleProcessPayment = async () => {
    if (!validateCheckoutForm()) {
      toast.error('Please fix all errors before proceeding');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1200));

      toast.success('Order placed successfully!', {
        description: `Order ID: ORD_${Date.now()}. Your order will be shipped within 2-3 business days.`,
      });

      // Clear cart and reset
      clearCart();
      setIsCheckingOut(false);
      setCheckoutData({ email: '', fullName: '', address: '', city: '', zipCode: '' });

      // Navigate to orders page after a delay
      setTimeout(() => {
        navigate('/user/orders');
      }, 1500);
    } catch (error) {
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">Your cart is empty</p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Button onClick={() => navigate('/user/marketplace')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/user/marketplace')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
        <h1 className="text-3xl font-bold text-foreground mt-4">Shopping Cart</h1>
        <p className="text-muted-foreground mt-1">{cartItems.length} items in your cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;

            return (
              <Card key={item.productId}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartQuantity(item.productId, parseInt(e.target.value) || 1)
                            }
                            className="w-12 text-center border-0 bg-transparent"
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">${item.price} each</p>
                          <p className="text-lg font-semibold text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary & Checkout */}
        <div className="lg:col-span-1">
          {!isCheckingOut ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-foreground">
                      {shipping === 0 ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsCheckingOut(true)}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/user/marketplace')}
                  >
                    Continue Shopping
                  </Button>
                </div>

                {subtotal < 100 && (
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Complete your purchase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={checkoutData.email}
                    onChange={(e) => handleCheckoutChange('email', e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={checkoutData.fullName}
                    onChange={(e) => handleCheckoutChange('fullName', e.target.value)}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={checkoutData.address}
                    onChange={(e) => handleCheckoutChange('address', e.target.value)}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={checkoutData.city}
                      onChange={(e) => handleCheckoutChange('city', e.target.value)}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP *</Label>
                    <Input
                      id="zipCode"
                      value={checkoutData.zipCode}
                      onChange={(e) => handleCheckoutChange('zipCode', e.target.value)}
                      className={errors.zipCode ? 'border-destructive' : ''}
                    />
                    {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode}</p>}
                  </div>
                </div>

                <div className="pt-4 space-y-2 border-t border-border">
                  <Button
                    className="w-full"
                    disabled={isProcessing}
                    onClick={handleProcessPayment}
                  >
                    {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isProcessing}
                    onClick={() => setIsCheckingOut(false)}
                  >
                    Back to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;