import { createBrowserRouter, Navigate } from 'react-router-dom';
import Index from './pages/index';
import Login from './pages/login';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// user pages
import UserDashboard from './pages/user';
import BookService from './pages/user/book';
import Marketplace from './pages/user/marketplace';
import Payments from './pages/user/payments';
import Subscription from './pages/user/subscription';
import Orders from './pages/user/orders';
import Ratings from './pages/user/ratings';
import UserMessages from './pages/user/messages';
import UserProfile from './pages/user/profile';
import ShoppingCart from './pages/user/cart';
import UserNotifications from './pages/user/notifications';
import Bookings from './pages/user/bookings';
import PaymentPage from './pages/user/PaymentPage';

// Provider pages
import ProviderDashboard from './pages/provider';
import JobsList from './pages/provider/jobs';
import Earnings from './pages/provider/earnings';
import ProviderProfile from './pages/provider/profile';
import JobDetails from './pages/provider/job-details';
import AvailabilityCalendar from './pages/provider/availability';
import RatingsAndReviews from './pages/provider/ratings';
import SkillsAndServices from './pages/provider/skills';
import ProviderNotifications from './pages/provider/notifications';
import Messages from './pages/provider/messages';
import PaymentSettings from './pages/provider/payment-settings';
// Admin pages
import AdminDashboard from './pages/admin';
import AdminUsers from './pages/admin/users';
import AdminAnalytics from './pages/admin/analytics';
import ProvidersManagement from './pages/admin/providers';
import ServicesManagement from './pages/admin/services';
import ProductsManagement from './pages/admin/products';
import OrdersManagement from './pages/admin/orders';
import BookingsManagement from './pages/admin/bookings';
import PaymentsManagement from './pages/admin/payments';
import SubscriptionsMonitoring from './pages/admin/subscriptions';
import SystemAlerts from './pages/admin/system';
import ChatMonitor from './pages/admin/chat-monitor';
import AdminNotifications from './pages/admin/notifications';
import ProviderMessages from './pages/provider/messages';

const routes = [
  {
    path: '/',
    element: <Index />,
  },
  // {
  //   path: '/login',
  //   element: <Login />,
  // },

  // user Dashboard
  {
    path: '/user',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <UserDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/book',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <BookService />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/bookings',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
         <Bookings/>
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/marketplace',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <Marketplace />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/orders',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <Orders />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/payments',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <Payments />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/payment/:bookingId',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <PaymentPage />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/ratings',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <Ratings />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/subscription',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <Subscription />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/messages',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <UserMessages />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/profile',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <UserProfile />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/cart',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <ShoppingCart />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/notifications',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <DashboardLayout>
          <UserNotifications />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },

  // Provider Dashboard
  {
    path: '/provider',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <ProviderDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  // {
  //   path: '/provider/jobs',
  //   element: (
  //     <ProtectedRoute allowedRoles={['provider']}>
  //       <DashboardLayout>
  //         <JobsList />
  //       </DashboardLayout>
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: '/provider/earnings',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <Earnings />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/availability',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <AvailabilityCalendar />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/profile',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <ProviderProfile />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/messages',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <ProviderMessages />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/job-details',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <JobDetails />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/ratings',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <RatingsAndReviews />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/skills',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <SkillsAndServices />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/notifications',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <ProviderNotifications />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/provider/payment-settings',
    element: (
      <ProtectedRoute allowedRoles={['provider']}>
        <DashboardLayout>
          <PaymentSettings />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },

  // Admin Dashboard
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/analytics',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <AdminAnalytics />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <AdminUsers />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/providers',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <ProvidersManagement />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/services',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <ServicesManagement />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <ProductsManagement />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <OrdersManagement />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/bookings',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <BookingsManagement />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/payments',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <PaymentsManagement />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/system',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <SystemAlerts />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/subscriptions',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <SubscriptionsMonitoring />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/chat-monitor',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <ChatMonitor />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/messages',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <ChatMonitor />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/notifications',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <AdminNotifications />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: '*',
    element: <NotFound />,
  },
];

const basename = (window as any).__APP_BASENAME__ || '/';
export const router = createBrowserRouter(routes, { basename });