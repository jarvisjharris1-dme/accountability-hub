import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AdminRoute } from "@/components/AdminRoute";
import { TermsOfServiceModal } from '@/components/TermsOfServiceModal';
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal';
import { useTermsEnforcement } from '@/hooks/useTermsEnforcement';
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Goals from "./pages/Goals";
import Achievements from "./pages/Achievements";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/AdminDashboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🔥 NEW: AppContent component with Terms enforcement
function AppContent() {
  // Check if user needs to accept terms
  const { needsAcceptance, loading, markAsAccepted } = useTermsEnforcement();
  
  // State for Privacy Policy modal
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Show loading while checking terms status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a2332] to-[#2d3e50]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Your existing app routes */}
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>

      {/* 🔥 NEW: Terms of Service Modal - Shows if user hasn't accepted */}
      <TermsOfServiceModal
        isOpen={needsAcceptance}
        onAccept={markAsAccepted}
        onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        canClose={false}  // User MUST accept to use app
      />

      {/* 🔥 NEW: Privacy Policy Modal - Shows when requested */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </>
  );
}

// Main App component
const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

