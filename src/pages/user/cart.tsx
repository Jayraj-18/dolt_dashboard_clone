import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { toast } from 'sonner';
import { createOrder } from '../../api/orders';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, ProductData } from '../../api/products';
import { calculateFees } from '../../lib/feeCalculator';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateCartQuantity, clearCart } = useData();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  const [checkoutData, setCheckoutData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '', // ✅ Added phone number
    address: '',
    city: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
    // ✅ Pre-fill user data if available
    if (user) {
      setCheckoutData(prev => ({
        ...prev,
        email: user.email || '',
        fullName: user.name || user.fullName || '',
        phoneNumber: user.phone || '' // ✅ Pre-fill phone
      }));
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (id: string) => products.find((p) => p._id === id);

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
    if (!checkoutData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'; // ✅ Validate phone
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

    if (!user) {
      toast.error('You must be logged in to checkout');
      return;
    }

    setIsProcessing(true);

    try {
      // ✅ Filter out items where product not found, and attach providerId
      const orderItems = cartItems.map(item => {
        const product = getProduct(item.productId);
        if (!product) return null;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: product.name,
          providerId: product.providerId // ✅ Critical for splitting orders
        };
      }).filter(Boolean);

      if (orderItems.length === 0) {
        toast.error("Cart is empty or products unavailable");
        setIsProcessing(false);
        return;
      }

      const response = await createOrder({
        userid: user.id,
        username: user.name || user.email,
        details: checkoutData,
        items: orderItems as any[],
        total_amount: total
      });

      toast.success('Order placed successfully!', {
        description: `Proceeding to payment...`,
      });

      clearCart();
      setIsCheckingOut(false);
      setCheckoutData({ email: '', fullName: '', phoneNumber: '', address: '', city: '', zipCode: '' });

      if (response && response.checkoutGroupId) {
        setTimeout(() => {
          navigate(`/user/payment/${response.checkoutGroupId}`);
        }, 1500);
      } else {
        // Fallback if no checkoutGroupId (legacy behavior or error)
        setTimeout(() => {
          navigate('/user/orders');
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading cart...</div>;

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
                            max={product.stock}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
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
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">DOLT Fee (2.05%)</span>
                    <span className="text-foreground">${calculateFees(subtotal).doltFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Marketplace Charge (5%)</span>
                    <span className="text-foreground">${calculateFees(subtotal).marketplaceCharge.toFixed(2)}</span>
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
                  <span className="text-2xl font-bold text-primary">${(calculateFees(subtotal).finalAmount + shipping).toFixed(2)}</span>
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
                  <Label htmlFor="phoneNumber">Mobile Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={checkoutData.phoneNumber}
                    onChange={(e) => handleCheckoutChange('phoneNumber', e.target.value)}
                    className={errors.phoneNumber ? 'border-destructive' : ''}
                    placeholder="Enter mobile number"
                  />
                  {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
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