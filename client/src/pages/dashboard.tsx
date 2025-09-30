import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { 
  Calendar, 
  Clock, 
  UserX, 
  Euro, 
  Plus, 
  UserPlus, 
  Bot,
  CalendarDays,
  Users,
  Scissors,
  BarChart
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Navigation from "@/components/navigation";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour accéder au dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: salon } = useQuery({
    queryKey: ["/api/salon"],
    retry: false,
  });

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: todayAppointments } = useQuery({
    queryKey: ["/api/salons", salon?.id, "appointments"],
    enabled: !!salon?.id,
    retry: false,
  });

  // Mock data for demonstration
  const mockStats = {
    todayAppointments: 23,
    availableSlots: 8,
    noShows: 2,
    todayRevenue: 1247,
  };

  const mockUpcomingAppointments = [
    {
      id: "1",
      client: { firstName: "Marie", lastName: "Dubois" },
      service: { name: "Coupe + Couleur" },
      stylist: { firstName: "Sarah" },
      startTime: "14:30",
    },
    {
      id: "2",
      client: { firstName: "Jean", lastName: "Martin" },
      service: { name: "Coupe Homme" },
      stylist: { firstName: "Alex" },
      startTime: "15:00",
    },
    {
      id: "3",
      client: { firstName: "Lisa", lastName: "Durand" },
      service: { name: "Brushing" },
      stylist: { firstName: "Emma" },
      startTime: "15:45",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        
        {/* Dashboard Header */}
        <div className="glassmorphism-card rounded-3xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-6 border-b border-border/20">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Bonjour, {salon?.name || "Salon Éclat"}
              </h1>
              <p className="text-muted-foreground">
                {format(today, "EEEE d MMMM yyyy", { locale: fr })}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <Button 
                variant="outline" 
                className="btn-secondary px-4 py-2 text-sm font-medium"
                data-testid="button-new-service"
                onClick={() => setLocation("/services")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau service
              </Button>
              <Button 
                variant="outline" 
                className="btn-secondary px-4 py-2 text-sm font-medium"
                data-testid="button-add-stylist"
                onClick={() => setLocation("/stylists")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter styliste
              </Button>
              <Button 
                className="btn-primary px-4 py-2 text-white text-sm font-medium"
                data-testid="button-ai-assistant"
                onClick={() => setLocation("/voice")}
              >
                <Bot className="mr-2 h-4 w-4" />
                Assistant IA
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/50 rounded-2xl p-6 border border-border/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="stat-today-appointments">
                {mockStats.todayAppointments}
              </div>
              <div className="text-sm text-muted-foreground">RDV du jour</div>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-border/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">-3%</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="stat-available-slots">
                {mockStats.availableSlots}
              </div>
              <div className="text-sm text-muted-foreground">Slots libres</div>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-border/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <UserX className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">+1</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="stat-no-shows">
                {mockStats.noShows}
              </div>
              <div className="text-sm text-muted-foreground">No-shows</div>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-border/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Euro className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1" data-testid="stat-today-revenue">
                {mockStats.todayRevenue}€
              </div>
              <div className="text-sm text-muted-foreground">CA aujourd'hui</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/50 rounded-2xl p-6 border border-border/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">Prochains rendez-vous</h3>
              <div className="space-y-4">
                {mockUpcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {appointment.client.firstName[0]}{appointment.client.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {appointment.client.firstName} {appointment.client.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.service.name} • {appointment.startTime}
                      </div>
                    </div>
                    <div className="text-primary font-medium">
                      {appointment.stylist.firstName}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-border/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">Accès rapide</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="btn-secondary p-4 h-auto flex flex-col items-start text-left hover:bg-white/80"
                  data-testid="button-quick-calendar"
                  onClick={() => setLocation("/calendar")}
                >
                  <CalendarDays className="h-6 w-6 text-primary mb-2" />
                  <div className="font-medium text-foreground">Calendrier</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-secondary p-4 h-auto flex flex-col items-start text-left hover:bg-white/80"
                  data-testid="button-quick-clients"
                  onClick={() => setLocation("/clients")}
                >
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <div className="font-medium text-foreground">Clients</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-secondary p-4 h-auto flex flex-col items-start text-left hover:bg-white/80"
                  data-testid="button-quick-services"
                  onClick={() => setLocation("/services")}
                >
                  <Scissors className="h-6 w-6 text-primary mb-2" />
                  <div className="font-medium text-foreground">Services</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-secondary p-4 h-auto flex flex-col items-start text-left hover:bg-white/80"
                  data-testid="button-quick-reports"
                  onClick={() => {
                    toast({
                      title: "Bientôt disponible",
                      description: "La page de rapports sera disponible prochainement.",
                    });
                  }}
                >
                  <BarChart className="h-6 w-6 text-primary mb-2" />
                  <div className="font-medium text-foreground">Rapports</div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
