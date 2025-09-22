import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Scissors, Home, Calendar, Users, User, BarChart, ArrowLeft } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", label: "Accueil", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: BarChart },
    { path: "/calendar", label: "Calendrier", icon: Calendar },
    { path: "/services", label: "Services", icon: Scissors },
    { path: "/stylists", label: "Stylistes", icon: Users },
    { path: "/clients", label: "Clients", icon: User },
  ];

  const currentItem = navItems.find(item => item.path === location);

  return (
    <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Scissors className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-foreground">SalonPilot</span>
            </div>
            
            {/* Show current page indicator on mobile */}
            <div className="md:hidden">
              {currentItem && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <currentItem.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentItem.label}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location === item.path ? "default" : "ghost"}
                onClick={() => setLocation(item.path)}
                className={`flex items-center space-x-2 ${
                  location === item.path 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-primary"
                }`}
                data-testid={`nav-${item.path.replace("/", "") || "home"}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Mobile Back Button or Logout */}
          <div className="flex items-center space-x-4">
            {location !== "/" && (
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="md:hidden"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/api/logout"}
              className="text-muted-foreground hover:text-primary"
              data-testid="button-logout"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                  location === item.path 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
                data-testid={`mobile-nav-${item.path.replace("/", "") || "home"}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
