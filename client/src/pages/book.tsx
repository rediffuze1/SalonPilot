import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Scissors, Clock, Euro, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Navigation from "@/components/navigation";

interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: string;
  tags: string[];
}

interface Stylist {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  specialties: string[];
}

interface BookingFormData {
  serviceId: string;
  stylistId: string;
  date: Date | undefined;
  timeSlot: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
  };
}

export default function Book() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: "",
    stylistId: "",
    date: undefined,
    timeSlot: "",
    clientInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get demo salon ID (in a real app, this would come from the selected salon)
  const demoSalonId = "demo-salon-1";

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/salons", demoSalonId, "services"],
  });

  const { data: stylists, isLoading: stylistsLoading } = useQuery({
    queryKey: ["/api/salons", demoSalonId, "stylists"],
  });

  const selectedService = services?.find((s: Service) => s.id === formData.serviceId);
  const selectedStylist = stylists?.find((s: Stylist) => s.id === formData.stylistId);

  // Fetch available slots when service, stylist, and date are selected
  useEffect(() => {
    if (formData.serviceId && formData.stylistId && formData.date && selectedService) {
      fetchAvailableSlots();
    }
  }, [formData.serviceId, formData.stylistId, formData.date, selectedService]);

  const fetchAvailableSlots = async () => {
    if (!formData.date || !selectedService) return;

    try {
      const response = await fetch(
        `/api/salons/${demoSalonId}/stylists/${formData.stylistId}/availability?date=${formData.date.toISOString()}&duration=${selectedService.durationMinutes}`
      );
      const slots = await response.json();
      setAvailableSlots(slots.map((slot: string) => new Date(slot)));
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailableSlots([]);
    }
  };

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rendez-vous confirmé ✨",
        description: "Votre rendez-vous a été réservé avec succès!",
      });
      setStep(5); // Confirmation step
      queryClient.invalidateQueries({ queryKey: ["/api/salons", demoSalonId, "appointments"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await apiRequest("POST", "/api/clients", clientData);
      return response.json();
    },
  });

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.timeSlot || !selectedService) return;

    try {
      // Create or get client
      const client = await createClientMutation.mutateAsync(formData.clientInfo);
      
      // Parse the selected time slot
      const [hours, minutes] = formData.timeSlot.split(':').map(Number);
      const startTime = new Date(formData.date);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + selectedService.durationMinutes);

      // Create appointment
      const appointmentData = {
        salonId: demoSalonId,
        clientId: client.id,
        stylistId: formData.stylistId,
        serviceId: formData.serviceId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalAmount: selectedService.price,
        status: "confirmed",
        channel: "form",
        notes: formData.clientInfo.notes,
      };

      await createAppointmentMutation.mutateAsync(appointmentData);
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  if (servicesLoading || stylistsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Étape {step} sur 4
            </div>
          </div>

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scissors className="mr-2 h-5 w-5" />
                  Choisissez votre service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services?.map((service: Service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.serviceId === service.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, serviceId: service.id })}
                    data-testid={`service-option-${service.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {service.durationMinutes} min
                          </span>
                          <span className="flex items-center">
                            <Euro className="mr-1 h-4 w-4" />
                            {service.price}€
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleNext} 
                    disabled={!formData.serviceId}
                    data-testid="button-next-service"
                  >
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Stylist Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Choisissez votre styliste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stylists?.map((stylist: Stylist) => (
                  <div
                    key={stylist.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.stylistId === stylist.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, stylistId: stylist.id })}
                    data-testid={`stylist-option-${stylist.id}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                        {stylist.firstName[0]}{stylist.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold">{stylist.firstName} {stylist.lastName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Spécialités: {stylist.specialties.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} data-testid="button-back-stylist">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!formData.stylistId}
                    data-testid="button-next-stylist"
                  >
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Date & Time Selection */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Choisissez la date et l'heure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Date</Label>
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date, timeSlot: "" })}
                    disabled={(date) => date < new Date() || date < new Date(Date.now() - 86400000)}
                    locale={fr}
                    className="rounded-md border"
                  />
                </div>
                
                {formData.date && (
                  <div>
                    <Label>Créneaux disponibles</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={formData.timeSlot === format(slot, 'HH:mm') ? "default" : "outline"}
                          onClick={() => setFormData({ ...formData, timeSlot: format(slot, 'HH:mm') })}
                          className="text-sm"
                          data-testid={`time-slot-${format(slot, 'HH:mm')}`}
                        >
                          {format(slot, 'HH:mm')}
                        </Button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Aucun créneau disponible pour cette date.
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} data-testid="button-back-datetime">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!formData.date || !formData.timeSlot}
                    data-testid="button-next-datetime"
                  >
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Client Information */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Vos informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.clientInfo.firstName}
                      onChange={(e) => setFormData({
                        ...formData,
                        clientInfo: { ...formData.clientInfo, firstName: e.target.value }
                      })}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.clientInfo.lastName}
                      onChange={(e) => setFormData({
                        ...formData,
                        clientInfo: { ...formData.clientInfo, lastName: e.target.value }
                      })}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.clientInfo.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientInfo: { ...formData.clientInfo, email: e.target.value }
                    })}
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.clientInfo.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientInfo: { ...formData.clientInfo, phone: e.target.value }
                    })}
                    data-testid="input-phone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={formData.clientInfo.notes}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientInfo: { ...formData.clientInfo, notes: e.target.value }
                    })}
                    placeholder="Informations supplémentaires..."
                    data-testid="input-notes"
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Récapitulatif</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Service:</strong> {selectedService?.name}</p>
                    <p><strong>Styliste:</strong> {selectedStylist?.firstName} {selectedStylist?.lastName}</p>
                    <p><strong>Date:</strong> {formData.date && format(formData.date, 'EEEE d MMMM yyyy', { locale: fr })}</p>
                    <p><strong>Heure:</strong> {formData.timeSlot}</p>
                    <p><strong>Prix:</strong> {selectedService?.price}€</p>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} data-testid="button-back-info">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!formData.clientInfo.firstName || !formData.clientInfo.lastName || !formData.clientInfo.email || createAppointmentMutation.isPending}
                    data-testid="button-confirm-booking"
                  >
                    {createAppointmentMutation.isPending ? "Confirmation..." : "Confirmer la réservation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-primary">
                  <Check className="mx-auto h-12 w-12 mb-4" />
                  Rendez-vous confirmé !
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg">
                  Votre rendez-vous a été réservé avec succès.
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Détails de votre rendez-vous</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Service:</strong> {selectedService?.name}</p>
                    <p><strong>Styliste:</strong> {selectedStylist?.firstName} {selectedStylist?.lastName}</p>
                    <p><strong>Date:</strong> {formData.date && format(formData.date, 'EEEE d MMMM yyyy', { locale: fr })}</p>
                    <p><strong>Heure:</strong> {formData.timeSlot}</p>
                    <p><strong>Prix:</strong> {selectedService?.price}€</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Un email de confirmation vous a été envoyé à {formData.clientInfo.email}
                </p>
                
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="w-full"
                  data-testid="button-back-home"
                >
                  Retour à l'accueil
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
