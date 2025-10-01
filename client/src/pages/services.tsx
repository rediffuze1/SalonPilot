import { useState } from "react";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const serviceSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional().default(""),
  price: z.union([z.number(), z.string()]),
  duration: z.union([z.number(), z.string()]),
  breakBefore: z.union([z.number(), z.string()]).optional(),
  breakAfter: z.union([z.number(), z.string()]).optional(),
  tags: z.array(z.string()).optional(),
  depositRequired: z.union([z.boolean(), z.string()]).optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// Helpers de normalisation front -> backend
const toNumber = (v: unknown, fallback = 0) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

const toBool = (v: unknown, fallback = false) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true";
  return fallback;
};

export default function ServicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ➜ on lit le salon courant pour envoyer salonId au backend
  const { data: salon } = useQuery({ queryKey: ["/api/salon"], retry: false });

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
    retry: false,
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: 30,
      breakBefore: 0,
      breakAfter: 0,
      tags: [],
      depositRequired: false,
    },
  });

  const onApiError = async (res: Response) => {
    let msg = "Erreur inconnue";
    try {
      const data = await res.json();
      msg = data?.message || JSON.stringify(data);
    } catch {
      try {
        msg = await res.text();
      } catch {}
    }
    toast({
      title: "Erreur",
      description: msg || "Impossible de créer le service.",
      variant: "destructive",
    });
  };

  const createServiceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/services", payload);
      if (!res.ok) {
        await onApiError(res);
        throw new Error("create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Service créé", description: "Le service a été ajouté." });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/api/login"), 500);
      }
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/services/${id}`, data);
      if (!res.ok) {
        await onApiError(res);
        throw new Error("update failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service modifié",
        description: "Le service a été mis à jour.",
      });
      setIsDialogOpen(false);
      setEditing(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/api/login"), 500);
      }
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    // payload normalisé + salonId
    const cleaned = {
      salonId: salon?.id ?? undefined, // ← indispensable si l’API est multi-salon
      name: data.name,
      description: data.description ?? "",
      price: toNumber(data.price),
      duration: toNumber(data.duration),
      breakBefore: toNumber(data.breakBefore, 0),
      breakAfter: toNumber(data.breakAfter, 0),
      tags: Array.isArray(data.tags) ? data.tags : [],
      depositRequired: toBool(data.depositRequired, false),
    };

    if (editing) {
      updateServiceMutation.mutate({ id: editing.id, data: cleaned });
    } else {
      createServiceMutation.mutate(cleaned);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Gestion des Services</h1>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  form.reset();
                }}
              >
                Ajouter un service
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Modifier un service" : "Ajouter un service"}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du service</FormLabel>
                          <FormControl>
                            <Input placeholder="Coupe + Brushing" {...field} />
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
                            <Input inputMode="decimal" {...field} />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée (min)</FormLabel>
                          <FormControl>
                            <Input inputMode="numeric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="breakBefore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pause avant (min)</FormLabel>
                          <FormControl>
                            <Input inputMode="numeric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="breakAfter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pause après (min)</FormLabel>
                          <FormControl>
                            <Input inputMode="numeric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="depositRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Nécessite un acompte</FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createServiceMutation.isPending ||
                        updateServiceMutation.isPending
                      }
                    >
                      {createServiceMutation.isPending ||
                      updateServiceMutation.isPending
                        ? "Enregistrement..."
                        : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glassmorphism-card">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ul className="space-y-3">
                {(services ?? []).map((s: any) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {s.duration} min • {s.price} €
                        {s.depositRequired ? " • acompte requis" : ""}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(s);
                        form.reset({
                          name: s.name ?? "",
                          description: s.description ?? "",
                          price: s.price ?? 0,
                          duration: s.duration ?? 30,
                          breakBefore: s.breakBefore ?? 0,
                          breakAfter: s.breakAfter ?? 0,
                          tags: Array.isArray(s.tags) ? s.tags : [],
                          depositRequired: Boolean(s.depositRequired),
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      Modifier
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
