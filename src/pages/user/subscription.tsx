import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockSubscriptions } from '../../lib/mockData';
import { Check, X, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const Subscription = () => {
  const currentPlan = mockSubscriptions.premium; // Assuming user has premium

  const plans = [
    {
      type: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Get started with basic features',
      features: [
        { name: 'Browse Services', included: true },
        { name: 'Limited Bookings (2/month)', included: true },
        { name: 'Basic Support', included: true },
        { name: 'Priority Support', included: false },
        { name: 'Exclusive Deals', included: false },
        { name: 'Unlimited Bookings', included: false },
      ],
    },
    {
      type: 'premium',
      name: 'Premium',
      price: 9.99,
      period: 'month',
      description: 'Unlock all features and priority support',
      features: [
        { name: 'Browse Services', included: true },
        { name: 'Unlimited Bookings', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Exclusive Deals', included: true },
        { name: 'Save Favorites', included: true },
        { name: 'Early Access to New Services', included: true },
      ],
      recommended: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and unlock premium features</p>
      </div>

      {/* Current Plan */}


      {/* Plans Comparison */}
      {/* <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">All Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.type}
              className={`relative ${
                plan.type === 'premium'
                  ? 'border-primary shadow-lg md:scale-105 md:z-10'
                  : ''
              }`}
            > */}
              {/* {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
           
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.type === 'premium' ? 'default' : 'outline'}
                  disabled={plan.type === 'premium'}
                >
                  {plan.type === 'premium' ? 'Current Plan' : 'Upgrade'}
                  {plan.type !== 'premium' && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}



      {/* Subscription Management */}
  

      {/* Auto-Renewal Notice */}
      {/* <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your subscription will automatically renew on{' '}
              <span className="font-semibold text-foreground">
                {format(currentPlan.renewalDate, 'MMM d, yyyy')}
              </span>
              . You will be charged <span className="font-semibold">${currentPlan.monthlyPrice}</span> for the next
              billing period. You can cancel anytime without penalty.
            </p>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default Subscription;
