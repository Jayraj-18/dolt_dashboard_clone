import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UserRole } from '../types/auth';
import { ArrowRight, Home, Wrench, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      await login(email, selectedRole);
      navigate(`/${selectedRole}`);
    }
  };

  const quickLogin = async (role: UserRole, emailPrefix: string) => {
    await login(`${emailPrefix}@example.com`, role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            ServiceHub Pro
          </h1>
          <p className="text-lg text-accent font-semibold">
            Book services. Find providers. Manage your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Login Form */}
          <Card className="border border-border/50 shadow-orange-glow">
            <CardHeader>
              <CardTitle className="text-white">Login</CardTitle>
              <CardDescription>
                Choose your role and enter email to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-white">Select Your Role</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'user' as UserRole, label: 'user', icon: Home },
                      { value: 'provider' as UserRole, label: 'Provider', icon: Wrench },
                      { value: 'admin' as UserRole, label: 'Admin', icon: Shield },
                    ].map((role) => {
                      const isSelected = selectedRole === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={isSelected
                            ? 'p-3 rounded-lg border-2 border-accent bg-accent/20 text-accent font-bold transition-all duration-200'
                            : 'p-3 rounded-lg border-2 border-border bg-card text-white hover:border-accent/50 hover:text-accent transition-all duration-200'
                          }
                        >
                          <role.icon className="w-5 h-5 mx-auto mb-2" />
                          <span className="text-sm font-medium">{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input border-border text-white placeholder:text-muted-foreground"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" variant="default">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Demo Access */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Quick Demo Access</h2>
              <p className="text-sm text-muted-foreground">
                Try the application with pre-configured accounts
              </p>
            </div>

            {[
              {
                role: 'user' as UserRole,
                title: 'user Demo',
                description: 'Browse services, book appointments, track orders',
                icon: Home,
              },
              {
                role: 'provider' as UserRole,
                title: 'Provider Demo',
                description: 'Manage jobs, track earnings, update availability',
                icon: Wrench,
              },
              {
                role: 'admin' as UserRole,
                title: 'Admin Demo',
                description: 'View analytics, manage users, system oversight',
                icon: Shield,
              },
            ].map((demo) => (
              <Card
                key={demo.role}
                className="cursor-pointer hover:border-accent/50 hover:shadow-orange-glow/50 transition-all duration-200"
                onClick={() => quickLogin(demo.role, demo.role)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <demo.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{demo.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {demo.description}
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-3 p-0 h-auto text-accent hover:text-orange-600"
                        onClick={() => quickLogin(demo.role, demo.role)}
                      >
                        Launch Demo <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            This is a demo application. No real data is processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;