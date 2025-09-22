import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Filter } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, parseISO, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { type Appointment, type Stylist, type Service, type Client } from "@shared/schema";
import Navigation from "@/components/navigation";

interface AppointmentWithDetails extends Appointment {
  client?: Client;
  stylist?: Stylist;
  service?: Service;
}

export default function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedStylist, setSelectedStylist] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour accéder au calendrier.",
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

  const { data: stylists } = useQuery({
    queryKey: ["/api/salons", salon?.id, "stylists"],
    enabled: !!salon?.id,
    retry: false,
  });

  const { data: services } = useQuery({
    queryKey: ["/api/salons", salon?.id, "services"],
    enabled: !!salon?.id,
    retry: false,
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/salons", salon?.id, "appointments", weekStart.toISOString(), weekEnd.toISOString()],
    enabled: !!salon?.id,
    retry: false,
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const response = await apiRequest("PUT", `/api/appointments/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rendez-vous modifié",
        description: "Le rendez-vous a été modifié avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "appointments"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rendez-vous.",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Rendez-vous supprimé",
        description: "Le rendez-vous a été supprimé avec succès.",
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "appointments"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous.",
        variant: "destructive",
      });
    },
  });

  const getAppointmentDetails = (appointment: Appointment): AppointmentWithDetails => {
    const client = clients?.find((c: Client) => c.id === appointment.clientId);
    const stylist = stylists?.find((s: Stylist) => s.id === appointment.stylistId);
    const service = services?.find((s: Service) => s.id === appointment.serviceId);
    
    return {
      ...appointment,
      client,
      stylist,
      service,
    };
  };

  const filteredAppointments = appointments?.filter((appointment: Appointment) => {
    if (selectedStylist === "all") return true;
    return appointment.stylistId === selectedStylist;
  }) || [];

  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments.filter((appointment: Appointment) => {
      const appointmentDate = parseISO(appointment.startTime);
      return isSameDay(appointmentDate, day);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no_show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(getAppointmentDetails(appointment));
    setIsDialogOpen(true);
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    updateAppointmentMutation.mutate({
      id: appointmentId,
      data: { status: newStatus },
    });
  };

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <CalendarIcon className="mr-3 h-8 w-8" />
              Calendrier
            </h1>
            <p className="text-muted-foreground">Gérez vos rendez-vous par semaine</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedStylist} onValueChange={setSelectedStylist}>
                <SelectTrigger className="w-48" data-testid="select-stylist-filter">
                  <SelectValue placeholder="Filtrer par styliste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les stylistes</SelectItem>
                  {stylists?.map((stylist: Stylist) => (
                    <SelectItem key={stylist.id} value={stylist.id}>
                      {stylist.firstName} {stylist.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <Card className="glassmorphism-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreviousWeek}
                data-testid="button-previous-week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <CardTitle className="text-center">
                {format(weekStart, "d MMMM", { locale: fr })} - {format(weekEnd, "d MMMM yyyy", { locale: fr })}
              </CardTitle>
              
              <Button 
                variant="outline" 
                onClick={handleNextWeek}
                data-testid="button-next-week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        {appointmentsLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              
              return (
                <Card key={day.toISOString()} className="glassmorphism-card min-h-96">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-center text-sm">
                      <div className="font-semibold">
                        {format(day, "EEEE", { locale: fr })}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {format(day, "d")}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dayAppointments.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-4">
                        Aucun rendez-vous
                      </p>
                    ) : (
                      dayAppointments.map((appointment: Appointment) => {
                        const details = getAppointmentDetails(appointment);
                        const startTime = format(parseISO(appointment.startTime), "HH:mm");
                        
                        return (
                          <div
                            key={appointment.id}
                            className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(appointment.status)}`}
                            onClick={() => handleAppointmentClick(appointment)}
                            data-testid={`appointment-${appointment.id}`}
                          >
                            <div className="text-sm font-medium">
                              {startTime}
                            </div>
                            <div className="text-xs">
                              {details.client?.firstName} {details.client?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {details.service?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {details.stylist?.firstName}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Appointment Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Détails du rendez-vous</DialogTitle>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Client
                  </h4>
                  <p>{selectedAppointment.client?.firstName} {selectedAppointment.client?.lastName}</p>
                  {selectedAppointment.client?.email && (
                    <p className="text-sm text-muted-foreground">{selectedAppointment.client.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Service</h4>
                  <p>{selectedAppointment.service?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.service?.durationMinutes} min - {selectedAppointment.service?.price}€
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Styliste</h4>
                  <p>{selectedAppointment.stylist?.firstName} {selectedAppointment.stylist?.lastName}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Horaire
                  </h4>
                  <p>
                    {format(parseISO(selectedAppointment.startTime), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Statut</h4>
                  <Select 
                    value={selectedAppointment.status} 
                    onValueChange={(value) => handleStatusChange(selectedAppointment.id, value)}
                  >
                    <SelectTrigger data-testid="select-appointment-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                      <SelectItem value="no_show">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAppointment.notes && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-close-appointment"
                  >
                    Fermer
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) {
                        deleteAppointmentMutation.mutate(selectedAppointment.id);
                      }
                    }}
                    disabled={deleteAppointmentMutation.isPending}
                    data-testid="button-delete-appointment"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
