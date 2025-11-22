import { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";
import {
  Home,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
  MessageSquare,
  Users,
  FileText,
  ShoppingCart,
  DollarSign,
  LayoutGrid,
  Calendar,
  Star,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "../ui/badge";
import { becomeProvider, becomeUser, switchRole } from "../../api/roleActions"; // Import role actions
interface DashboardLayoutProps {
  children: ReactNode;
}
interface NavItem {
  label: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >;
  badge?: number; // optional badge
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout, setUser } = useAuth();
 
const MAIN_URL = import.meta.env.VITE_PUBLIC_FRONTEND_MAIN_URL 

   const { cartItems = [] } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <div>Loading...</div>; // wait until user is loaded

  if (!user) {
 
    return null;
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { label: "Overview", href: `/${user.role}`, icon: Home },
      // {
      //   label: "Messages",
      //   href: `/${user.role}/messages`,
      //   icon: MessageSquare,
      //   // badge: 2,
      // },
      // {
      //   label: "Notifications",
      //   href: `/${user.role}/notifications`,
      //   icon: Bell,
      //   // badge: 3,
      // },
    ];

    const roleSpecificItems: Record<string, NavItem[]> = {
      user: [
        { label: "Messages", href: "/user/messages", icon: MessageSquare },
        {  label: "Notifications", href: `/user/notifications`,  icon: Bell,},
        { label: "Book Service", href: "/user/book", icon: Calendar },
        { label: "My Bookings", href: "/user/bookings", icon: LayoutGrid },
        { label: "Marketplace", href: "/user/marketplace", icon: ShoppingCart },
        { label: "Orders", href: "/user/orders", icon: FileText },
        { label: "Payments", href: "/user/payments", icon: DollarSign },
        { label: "Ratings", href: "/user/ratings", icon: Star },
        { label: "Subscription", href: "/user/subscription", icon: Shield },
      ],
      provider: [
         { label: "Messages", href: "/provider/messages", icon: MessageSquare },
        {  label: "Notifications", href: `/provider/notifications`,  icon: Bell,},
       // { label: "My Jobs", href: "/provider/jobs", icon: LayoutGrid },
        { label: "Earnings", href: "/provider/earnings", icon: DollarSign },
        { label: "Calendar", href: "/provider/availability", icon: Calendar },
        { label: "Profile", href: "/provider/profile", icon: Settings },
      ],
      admin: [
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Providers", href: "/admin/providers", icon: CheckCircle2 },
        { label: "Services", href: "/admin/services", icon: LayoutGrid },
        { label: "Products", href: "/admin/products", icon: ShoppingCart },
        { label: "Orders", href: "/admin/orders", icon: FileText },
        { label: "Bookings", href: "/admin/bookings", icon: Calendar },
        { label: "Payments", href: "/admin/payments", icon: DollarSign },
        { label: "System", href: "/admin/system", icon: Settings },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const navItems = getNavItems();
  const isActive = (href: string) => location.pathname === href;

  return (
    <SidebarProvider>
      <Sidebar className="bg-sidebar border-r border-accent/30">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground text-xs font-bold px-2 py-3 uppercase tracking-widest border-b border-accent/20">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-orange-glow-sm" />
                {/* <span className="text-accent">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span> */}
                <span className="text-accent">{user.fullName}</span>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      onClick={() => navigate(item.href)}
                      className={`relative transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-accent/20 text-accent border-l-2 border-accent"
                          : "text-sidebar-foreground hover:bg-accent/10 hover:text-accent"
                      }`}
                    >
                      <button className="flex items-center gap-2 w-full">
                        <item.icon
                          className={`w-4 h-4 transition-colors ${
                            isActive(item.href)
                              ? "text-accent"
                              : "text-sidebar-foreground"
                          }`}
                        />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-accent text-black text-xs rounded-full px-2 py-0.5 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b-2 border-accent bg-background/95 backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-4 md:px-6 gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden text-white hover:text-accent transition-colors" />
              <h1 className="text-lg md:text-xl font-bold text-white hidden md:block">
                {user.role === "user" && "user Dashboard"}
                {user.role === "provider" && "Provider Dashboard"}
                {user.role === "admin" && "Admin Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              {/* <ThemeToggle /> */}

              {/* Cart for user */}
              {user.role === "user" && cartCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 relative border-accent/50 text-accent hover:text-accent hover:bg-accent/10"
                  onClick={() => navigate("/user/cart")}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-semibold">
                    Cart
                  </span>
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-black font-bold">
                    {cartCount}
                  </Badge>
                </Button>
              )}

              {/* Become Provider Button */}
              {!user.isAlsoProvider && user.role === "user" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await becomeProvider(user.id);
                    alert(result.message);
                    if (result.success) window.location.reload();
                  }}
                  className="hidden sm:flex gap-2 border-border text-white hover:text-accent hover:bg-accent/10"
                >
                  Become a Provider
                </Button>
              )}

              {/* Become User Button */}
              {!user.isAlsoUser && user.role === "provider" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await becomeUser(user.id);
                    alert(result.message);
                    if (result.success) window.location.reload();
                  }}
                  className="hidden sm:flex gap-2 border-border text-white hover:text-accent hover:bg-accent/10"
                >
                  Become a User
                </Button>
              )}

              {/* Switch Role Button */}
              {user.isAlsoProvider && user.isAlsoUser && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const result = await switchRole(
                      user.id,
                      user.role,
                      setUser
                    );
                    alert(result.message);
                    if (result.success) {
                      window.location.reload();
                    }
                  }}
                  className="sm:flex gap-2 border-border text-white hover:text-accent hover:bg-accent/10"
                >
                  Switch to {user.role === "user" ? "Provider" : "User"}
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white hover:text-accent hover:bg-accent/10"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-accent text-black font-bold">
                        {user.name}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-border"
                >
                  <DropdownMenuLabel className="text-white text-xs">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={() => navigate(`/${user.role}/profile`)}
                    className="text-white hover:text-accent hover:bg-accent/10 cursor-pointer"
                  >
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      //navigate(MAIN_URL);
                    }}
                    className="text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};
