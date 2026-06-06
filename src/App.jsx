import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Pages - Public
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// App Pages
import Dashboard from '@/pages/Dashboard';
import CustomerRequests from '@/pages/CustomerRequests';
import NewRequest from '@/pages/NewRequest';
import RequestDetail from '@/pages/RequestDetail';
import BrowseRequests from '@/pages/BrowseRequests';
import SubmitOffer from '@/pages/SubmitOffer';
import MyOffers from '@/pages/MyOffers';
import Messages from '@/pages/Messages';
import Analytics from '@/pages/Analytics';
import ProfessionalProfilePage from '@/pages/ProfessionalProfile';
import Notifications from '@/pages/Notifications';
import UserProfile from '@/pages/UserProfile';

// Admin Pages
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminProfessionals from '@/pages/AdminProfessionals';
import AdminOffers from '@/pages/AdminOffers';
import AdminRequests from '@/pages/AdminRequests';
import AdminCategories from '@/pages/AdminCategories';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading OfferMatch...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* App Routes with Layout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Customer Routes */}
        <Route path="/requests" element={<CustomerRequests />} />
        <Route path="/requests/new" element={<NewRequest />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/offers" element={<MyOffers />} />
        
        {/* Professional Routes */}
        <Route path="/browse-requests" element={<BrowseRequests />} />
        <Route path="/requests/:id/offer" element={<SubmitOffer />} />
        <Route path="/my-offers" element={<MyOffers />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile/professional" element={<ProfessionalProfilePage />} />
        
        {/* Shared Routes */}
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<UserProfile />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/professionals" element={<AdminProfessionals />} />
        <Route path="/admin/offers" element={<AdminOffers />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App