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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStylistSchema, type Stylist } from "@shared/schema";
import { z } from "zod";
import Navigation from "@/components/navigation";

const stylistFormSchema = insertStylistSchema.extend({
  specialties: z.array(z.string()).default([]),
});

type StylistFormData = z.infer<typeof stylistFormSchema>;

export default function Stylists() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [specialtyInput, setSpecialtyInput] = useState("");
  
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté pour gérer les stylistes.",
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

  const { data: stylists, isLoading: stylistsLoading } = useQuery({
    queryKey: ["/api/salons", salon?.id, "stylists"],
    enabled: !!salon?.id,
    retry: false,
  });

  const form = useForm<StylistFormData>({
    resolver: zodResolver(stylistFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      photoUrl: "",
      specialties: [],
      isActive: true,
    },
  });

  const createStylistMutation = useMutation({
    mutationFn: async (data: StylistFormData) => {
      const response = await apiRequest("POST", `/api/salons/${salon?.id}/stylists`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Styliste ajouté",
        description: "Le styliste a été ajouté avec succès.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "stylists"] });
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
        description: "Impossible d'ajouter le styliste.",
        variant: "destructive",
      });
    },
  });

  const updateStylistMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StylistFormData> }) => {
      const response = await apiRequest("PUT", `/api/stylists/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Styliste modifié",
        description: "Le styliste a été modifié avec succès.",
      });
      setIsDialogOpen(false);
      setEditingStylist(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "stylists"] });
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
        description: "Impossible de modifier le styliste.",
        variant: "destructive",
      });
    },
  });

  const deleteStylistMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/stylists/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Styliste supprimé",
        description: "Le styliste a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/salons", salon?.id, "stylists"] });
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
        description: "Impossible de supprimer le styliste.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist);
    form.reset({
      firstName: stylist.firstName,
      lastName: stylist.lastName,
      email: stylist.email || "",
      phone: stylist.phone || "",
      photoUrl: stylist.photoUrl || "",
      specialties: stylist.specialties || [],
      isActive: stylist.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce styliste ?")) {
      deleteStylistMutation.mutate(id);
    }
  };

  const onSubmit = (data: StylistFormData) => {
    if (editingStylist) {
      updateStylistMutation.mutate({ id: editingStylist.id, data });
    } else {
      createStylistMutation.mutate(data);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      const currentSpecialties = form.getValues("specialties");
      form.setValue("specialties", [...currentSpecialties, specialtyInput.trim()]);
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (index: number) => {
    const currentSpecialties = form.getValues("specialties");
    form.setValue("specialties", currentSpecialties.filter((_, i) => i !== index));
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
              <Users className="mr-3 h-8 w-8" />
              Gestion des Stylistes
            </h1>
            <p className="text-muted-foreground">Gérez votre équipe de stylistes</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="btn-primary px-6 py-3 text-white font-medium"
                onClick={() => {
                  setEditingStylist(null);
                  form.reset();
                }}
                data-testid="button-add-stylist"
              >
                <Plus className="mr-2 h-5 w-5" />
                Ajouter un styliste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStylist ? "Modifier le styliste" : "Ajouter un styliste"}
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
                            <Input placeholder="Sarah" {...field} data-testid="input-stylist-firstname" />
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
                            <Input placeholder="Martin" {...field} data-testid="input-stylist-lastname" />
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
                            <Input type="email" placeholder="sarah@example.com" {...field} data-testid="input-stylist-email" />
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
                            <Input placeholder="06 12 34 56 78" {...field} data-testid="input-stylist-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de la photo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} data-testid="input-stylist-photo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label>Spécialités</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        placeholder="Ajouter une spécialité"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                        data-testid="input-stylist-specialty"
                      />
                      <Button type="button" onClick={addSpecialty} data-testid="button-add-specialty">
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("specialties").map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSpecialty(index)}>
                          {specialty} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-stylist-active"
                          />
                        </FormControl>
                        <FormLabel>Styliste actif</FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel-stylist"
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createStylistMutation.isPending || updateStylistMutation.isPending}
                      data-testid="button-save-stylist"
                    >
                      {createStylistMutation.isPending || updateStylistMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {stylistsLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stylists?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucun styliste</h3>
                <p className="text-muted-foreground">Ajoutez votre premier styliste pour commencer.</p>
              </div>
            ) : (
              stylists?.map((stylist: Stylist) => (
                <Card key={stylist.id} className="glassmorphism-card hover:scale-105 transition-transform duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={stylist.photoUrl || undefined} />
                          <AvatarFallback>
                            {stylist.firstName[0]}{stylist.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {stylist.firstName} {stylist.lastName}
                          </div>
                          {!stylist.isActive && (
                            <Badge variant="destructive" className="text-xs">Inactif</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(stylist)}
                          data-testid={`button-edit-stylist-${stylist.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(stylist.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-stylist-${stylist.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stylist.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-2 h-4 w-4" />
                          {stylist.email}
                        </div>
                      )}
                      
                      {stylist.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-2 h-4 w-4" />
                          {stylist.phone}
                        </div>
                      )}

                      {stylist.specialties && stylist.specialties.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Spécialités:</p>
                          <div className="flex flex-wrap gap-1">
                            {stylist.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
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
