import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Auth Pages
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Dashboard
import UserDashboard from "./pages/UserDashboard";
import ProfileSettings from "./pages/ProfileSettings";

// Public Pages
import Home from "./pages/Home";
import GetStarted from "./pages/GetStarted";

// Marketplace & Commerce
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetails from "./pages/OrderDetails";

// Messaging
import Messaging from "./pages/Messaging";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/get-started" component={GetStarted} />

      {/* Auth */}
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Legacy redirects — keep for backward compatibility */}
      <Route path="/login"><Redirect to="/signin" /></Route>
      <Route path="/auth"><Redirect to="/signin" /></Route>
      <Route path="/register"><Redirect to="/signup" /></Route>

      {/* Dashboard */}
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/complete-profile" component={() => <ProfileSettings isGated={true} />} />
      <Route path="/profile-settings" component={() => <ProfileSettings />} />

      {/* Marketplace & Commerce */}
      <Route path="/marketplace" component={ProductListing} />
      <Route path="/marketplace/:category" component={ProductListing} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/order/:id" component={OrderDetails} />

      {/* Messaging */}
      <Route path="/messages" component={Messaging} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
