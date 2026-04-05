import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Activity, UtensilsCrossed, Pill, Bell, UserCircle, LogOut, Heart, Menu, X, Settings, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AICompanion } from "@/components/ai-companion/AICompanion";
import { useAppContext } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { fetchUserProfile, logoutUser, isAuthenticated, type UserProfile } from "@/lib/api";
import logo from "@/assets/preventx-logo.svg";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { aiCompanionEnabled, language: lang } = useAppContext();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchUserProfile()
        .then(setUser)
        .catch(() => {
          // Token might be invalid
          logoutUser();
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const firstName = user?.full_name?.split(" ")[0] || "User";
  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: t(lang, "dashboard"), path: "/dashboard" },
    { icon: Activity, label: t(lang, "vitals"), path: "/vitals" },
    { icon: UtensilsCrossed, label: t(lang, "dietExercise"), path: "/diet-exercise" },
    { icon: Pill, label: t(lang, "medications"), path: "/medications" },
    { icon: ShieldAlert, label: t(lang, "riskPrediction"), path: "/risk-prediction" },
    { icon: Bell, label: t(lang, "notifications"), path: "/notifications" },
    { icon: UserCircle, label: t(lang, "profile"), path: "/profile" },
    { icon: Settings, label: t(lang, "settings"), path: "/settings" },
  ];

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-card border-r border-border/50 fixed inset-y-0 left-0 z-30">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-8 w-8" />
            <span className="font-heading text-xl font-bold text-foreground">PreventX</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200", active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full">
            <LogOut className="h-5 w-5" />
            {t(lang, "logout")}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 glass-card border-r border-border/50 flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="PreventX Logo" className="h-8 w-8" />
                <span className="font-heading text-xl font-bold text-foreground">PreventX</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 glass-card border-b border-border/50 px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-1.5 hover:bg-accent rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <h2 className="font-heading font-semibold text-foreground text-sm sm:text-base">
              {t(lang, "welcomeBack")} <span className="gradient-text">{firstName}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10" onClick={() => navigate("/notifications")}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
            </Button>
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer" onClick={() => navigate("/profile")}>
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {aiCompanionEnabled && <AICompanion />}
    </div>
  );
};

export default DashboardLayout;
