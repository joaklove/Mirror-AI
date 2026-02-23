import { Navigate } from 'react-router-dom';
import Home from "./pages/Home";
import Index from "./pages/Index";
import Analysis from "./pages/Analysis";
import MultimodalAnalysis from "./pages/MultimodalAnalysis";
import PredictiveAnalysis from "./pages/PredictiveAnalysis";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { PrivacySettingsPage } from "./components/PrivacySettings";
import { ReminderSettingsPage } from "./components/ReminderSettings";
import { TagManagementPage } from "./components/TagManagement";
import ThirdPartyIntegration from "./components/third-party/ThirdPartyIntegration";
import { AppLayout } from "./components/AppLayout";
import { useAuth } from "./contexts/AuthContext";
import RecommendationAnalysis from "./pages/RecommendationAnalysis";
import ContextAnalysis from "./pages/ContextAnalysis";
import SocialAnalysis from "./pages/SocialAnalysis";
import ProfessionalAnalysis from "./pages/ProfessionalAnalysis";
import LifeQuality from "./pages/LifeQuality";
import PersonalGrowth from "./pages/PersonalGrowth";
import HealthPage from "./pages/HealthPage";
import SustainablePage from "./pages/SustainablePage";

export interface RouteConfig {
  path: string;
  name: string;
  element: JSX.Element;
}

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mist">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mist">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-500"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export const routers: RouteConfig[] = [
    {
      path: "/",
      name: 'home',
      element: <ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/analysis",
      name: 'analysis',
      element: <ProtectedRoute><AppLayout><Analysis /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/multimodal",
      name: 'multimodal',
      element: <ProtectedRoute><AppLayout><MultimodalAnalysis /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/predictive",
      name: 'predictive',
      element: <ProtectedRoute><AppLayout><PredictiveAnalysis /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/auth",
      name: 'auth',
      element: <PublicRoute><Auth /></PublicRoute>,
    },
    {
      path: "/privacy",
      name: 'privacy',
      element: <ProtectedRoute><AppLayout><PrivacySettingsPage /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/reminders",
      name: 'reminders',
      element: <ProtectedRoute><AppLayout><ReminderSettingsPage /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/settings",
      name: 'settings',
      element: <ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/tags",
      name: 'tags',
      element: <ProtectedRoute><AppLayout><TagManagementPage /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/integrations",
      name: 'integrations',
      element: <ProtectedRoute><AppLayout><ThirdPartyIntegration /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/recommendation",
      name: 'recommendation',
      element: <ProtectedRoute><AppLayout><RecommendationAnalysis /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/context",
      name: 'context',
      element: <ProtectedRoute><AppLayout><ContextAnalysis /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/social",
      name: 'social',
      element: <ProtectedRoute><AppLayout><SocialAnalysis /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/professional",
      name: 'professional',
      element: <ProtectedRoute><AppLayout><ProfessionalAnalysis /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/life-quality",
      name: 'life-quality',
      element: <ProtectedRoute><AppLayout><LifeQuality /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/personal-growth",
      name: 'personal-growth',
      element: <ProtectedRoute><AppLayout><PersonalGrowth /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/health",
      name: 'health',
      element: <ProtectedRoute><AppLayout><HealthPage /></AppLayout></ProtectedRoute>,
    },
    {
      path: "/sustainable",
      name: 'sustainable',
      element: <ProtectedRoute><AppLayout><SustainablePage /></AppLayout></ProtectedRoute>,
    },
    {
      path: "*",
      name: '404',
      element: <NotFound />,
    },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
