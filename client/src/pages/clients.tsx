import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Edit, Mail, Phone, Search, Calendar, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type Client, type Stylist, type Appointment } from "@shared/schema";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Navigation from "@/components/navigation";

const clientFormSchema = insertClientSchema;
type ClientFormData = z.infer<typeof clientFormSchema>;

export default function Clients() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour gérer les clients.",
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

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/clients"],
    retry: false,
  });

  const { data: stylists } = useQuery({
    queryKey: ["/api/salons", salon?.id, "stylists"],
    enabled: !!salon?.id,
    retry: false,
  });

  const { data: appointments } = useQuery({
    queryKey: ["/api/salons", salon?.id, "appointments"],
    enabled: !!salon?.id,
    retry: false,
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
      preferredStylistId: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
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
        description: "Impossible d'ajouter le client.",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientFormData> }) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès.",
      });
      setIsDialogOpen(false);
      setEditingClient(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
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
        description: "Impossible de modifier le client.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || "",
      notes: client.notes || "",
      preferredStylistId: client.preferredStylistId || "",
    });
    setIsDialogOpen(true);
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
  };

  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data });
    } else {
      createClientMutation.mutate(data);
    }
  };

  const filteredClients = clients?.filter((client: Client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower))
    );
  }) || [];

  const getClientAppointments = (clientId: string) => {
    return appointments?.filter((appointment: Appointment) => 
      appointment.clientId === clientId
    ).sort((a: Appointment, b: Appointment) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    ) || [];
  };

  const getPreferredStylistName = (stylistId?: string) => {
    if (!stylistId) return null;
    const stylist = stylists?.find((s: Stylist) => s.id === stylistId);
    return stylist ? `${stylist.firstName} ${stylist.lastName}` : null;
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
              <Users className="mr-3 h-8 w-8" />
              Gestion des Clients
            </h1>
            <p className="text-muted-foreground">Gérez votre base clients</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="btn-primary px-6 py-3 text-white font-medium"
                onClick={() => {
                  setEditingClient(null);
                  form.reset();
                }}
                data-testid="button-add-client"
              >
                <Plus className="mr-2 h-5 w-5" />
                Ajouter un client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Modifier le client" : "Ajouter un client"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Marie" {...field} data-testid="input-client-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Dubois" {...field} data-testid="input-client-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="marie@example.com" {...field} data-testid="input-client-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="06 12 34 56 78" {...field} data-testid="input-client-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredStylistId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Styliste préféré (optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-preferred-stylist">
                              <SelectValue placeholder="Choisir un styliste" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Aucune préférence</SelectItem>
                            {stylists?.map((stylist: Stylist) => (
                              <SelectItem key={stylist.id} value={stylist.id}>
                                {stylist.firstName} {stylist.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Notes sur le client..." 
                            {...field} 
                            data-testid="input-client-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-client"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createClientMutation.isPending || updateClientMutation.isPending}
                      data-testid="button-save-client"
                    >
                      {createClientMutation.isPending || updateClientMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <Card className="glassmorphism-card mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-clients"
              />
            </div>
          </CardContent>
        </Card>

        {clientsLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Card className="glassmorphism-card">
            <CardContent className="p-0">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm ? "Aucun client trouvé" : "Aucun client"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Aucun client ne correspond à votre recherche." : "Ajoutez votre premier client pour commencer."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Styliste préféré</TableHead>
                      <TableHead>Dernière visite</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client: Client) => {
                      const clientAppointments = getClientAppointments(client.id);
                      const lastAppointment = clientAppointments[0];
                      
                      return (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {client.firstName[0]}{client.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {client.firstName} {client.lastName}
                                </div>
                                {client.notes && (
                                  <Badge variant="outline" className="text-xs">
                                    Notes
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Mail className="mr-1 h-3 w-3" />
                                {client.email}
                              </div>
                              {client.phone && (
                                <div className="flex items-center text-muted-foreground">
                                  <Phone className="mr-1 h-3 w-3" />
                                  {client.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPreferredStylistName(client.preferredStylistId) || (
                              <span className="text-muted-foreground">Aucune préférence</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {lastAppointment ? (
                              <div className="text-sm">
                                {format(parseISO(lastAppointment.startTime), "d MMM yyyy", { locale: fr })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Jamais</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewDetails(client)}
                                data-testid={`button-view-client-${client.id}`}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEdit(client)}
                                data-testid={`button-edit-client-${client.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Client Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du client</DialogTitle>
            </DialogHeader>
            
            {selectedClient && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {selectedClient.email}
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          {selectedClient.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedClient.preferredStylistId && (
                  <div>
                    <h4 className="font-semibold mb-2">Styliste préféré</h4>
                    <p>{getPreferredStylistName(selectedClient.preferredStylistId)}</p>
                  </div>
                )}

                {selectedClient.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-muted-foreground">{selectedClient.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Historique des rendez-vous
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {getClientAppointments(selectedClient.id).map((appointment: Appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {format(parseISO(appointment.startTime), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Service: Service #{appointment.serviceId} • Styliste: {appointment.stylistId}
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {getClientAppointments(selectedClient.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Aucun rendez-vous dans l'historique
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setIsDetailsDialogOpen(false)}
                    data-testid="button-close-client-details"
                  >
                    Fermer
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
