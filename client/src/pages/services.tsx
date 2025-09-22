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
import { Switch } from "@/components/ui/switch";
import { Scissors, Plus, Edit, Trash2, Clock, Euro } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema, type Service } from "@shared/schema";
import { z } from "zod";
import Navigation from "@/components/navigation";

const serviceFormSchema = insertServiceSchema.extend({
  tags: z.array(z.string()).default([]),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function Services() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [tagInput, setTagInput] = useState("");
  
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour gérer les services.",
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

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/salons", salon?.id, "services"],
    enabled: !!salon?.id,
    retry: false,
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 30,
      price: "0",
      tags: [],
      requiresDeposit: false,
      bufferBefore: 0,
      bufferAfter: 0,
      processingTime: 0,
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const response = await apiRequest("POST", `/api/salons/${salon?.id}/services`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service créé",
        description: "Le service a été créé avec succès.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "services"] });
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
        description: "Impossible de créer le service.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceFormData> }) => {
      const response = await apiRequest("PUT", `/api/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service modifié",
        description: "Le service a été modifié avec succès.",
      });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "services"] });
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
        description: "Impossible de modifier le service.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Service supprimé",
        description: "Le service a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "services"] });
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
        description: "Impossible de supprimer le service.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description || "",
      durationMinutes: service.durationMinutes,
      price: service.price,
      tags: service.tags || [],
      requiresDeposit: service.requiresDeposit || false,
      bufferBefore: service.bufferBefore || 0,
      bufferAfter: service.bufferAfter || 0,
      processingTime: service.processingTime || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  const onSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter((_, i) => i !== index));
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Scissors className="mr-3 h-8 w-8" />
              Gestion des Services
            </h1>
            <p className="text-muted-foreground">Gérez vos services et leurs tarifs</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="btn-primary px-6 py-3 text-white font-medium"
                onClick={() => {
                  setEditingService(null);
                  form.reset();
                }}
                data-testid="button-add-service"
              >
                <Plus className="mr-2 h-5 w-5" />
                Ajouter un service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Modifier le service" : "Ajouter un service"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du service</FormLabel>
                          <FormControl>
                            <Input placeholder="Coupe femme" {...field} data-testid="input-service-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prix (€)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="35.00" {...field} data-testid="input-service-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description du service..." 
                            {...field} 
                            data-testid="input-service-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="durationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="45" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-service-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bufferBefore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pause avant (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="15" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-service-buffer-before"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bufferAfter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pause après (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="15" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-service-buffer-after"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Ajouter un tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        data-testid="input-service-tag"
                      />
                      <Button type="button" onClick={addTag} data-testid="button-add-tag">
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("tags").map((tag, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(index)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="requiresDeposit"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-requires-deposit"
                          />
                        </FormControl>
                        <FormLabel>Nécessite un acompte</FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-service"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                      data-testid="button-save-service"
                    >
                      {createServiceMutation.isPending || updateServiceMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {servicesLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Scissors className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucun service</h3>
                <p className="text-muted-foreground">Ajoutez votre premier service pour commencer.</p>
              </div>
            ) : (
              services?.map((service: Service) => (
                <Card key={service.id} className="glassmorphism-card hover:scale-105 transition-transform duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{service.name}</span>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(service)}
                          data-testid={`button-edit-service-${service.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(service.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-service-${service.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm">{service.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {service.durationMinutes} min
                        </span>
                        <span className="flex items-center">
                          <Euro className="mr-1 h-4 w-4" />
                          {service.price}€
                        </span>
                      </div>

                      {service.tags && service.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {service.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {service.requiresDeposit && (
                        <Badge variant="secondary" className="text-xs">
                          Acompte requis
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
