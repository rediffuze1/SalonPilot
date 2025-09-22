import { Scissors, Bolt, Bot, Users, CreditCard, Shield, Clock, Smartphone, CheckCircle, Phone, Headphones, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import OrganicShapes from "@/components/organic-shapes";
import TypingAnimation from "@/components/typing-animation";
import GlassmorphismButton from "@/components/glassmorphism-button";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleBookingClick = () => {
    setLocation("/book");
  };

  const handleVoiceClick = () => {
    setLocation("/voice");
  };

  const handleLoginClick = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <OrganicShapes />
      
      {/* Header Navigation */}
      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Scissors className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-foreground">SalonPilot</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Comment ça marche</a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Tarifs</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={handleLoginClick}
                className="text-muted-foreground hover:text-primary"
                data-testid="button-login"
              >
                Se connecter
              </Button>
              <GlassmorphismButton 
                onClick={handleLoginClick}
                className="btn-primary px-6 py-2 text-white font-medium"
                data-testid="button-try-free"
              >
                Essayer gratuitement
              </GlassmorphismButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Réservez votre coupe en <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                quelques secondes
              </span>
            </h1>

            {/* Typing Subtitle */}
            <div className="typing-container h-16 mb-8">
              <TypingAnimation />
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Réservation en ligne et réceptionniste IA — en un seul endroit. 
              Simplifiez la gestion de votre salon avec notre plateforme complète.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <GlassmorphismButton 
                onClick={handleBookingClick}
                className="btn-primary px-8 py-4 text-white font-semibold text-lg w-full sm:w-auto"
                data-testid="button-book-appointment"
              >
                <Clock className="mr-2 h-5 w-5" />
                Prendre un rendez-vous
              </GlassmorphismButton>
              <GlassmorphismButton 
                onClick={handleVoiceClick}
                className="btn-secondary px-8 py-4 text-primary font-semibold text-lg w-full sm:w-auto"
                data-testid="button-voice-ai"
              >
                <Bot className="mr-2 h-5 w-5" />
                Parler à l'IA
              </GlassmorphismButton>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="text-primary h-5 w-5" />
                <span>100% Sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-primary h-5 w-5" />
                <span>24/7 Disponible</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="text-primary h-5 w-5" />
                <span>Mobile First</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ce que fait l'app
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment SalonPilot révolutionne la prise de rendez-vous pour les salons de coiffure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1: Express Booking */}
            <div className="glassmorphism-card rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bolt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Réservation express</h3>
              <p className="text-muted-foreground">
                Formulaire simple avec créneaux en temps réel. Réservez en moins de 2 minutes.
              </p>
            </div>

            {/* Feature 2: AI Receptionist */}
            <div className="glassmorphism-card rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">IA réceptionniste</h3>
              <p className="text-muted-foreground">
                Prise de RDV à la voix, 24/7, avec confirmations instantanées et compréhension naturelle.
              </p>
            </div>

            {/* Feature 3: Stylists & Services */}
            <div className="glassmorphism-card rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Stylistes & services</h3>
              <p className="text-muted-foreground">
                Choisissez votre coiffeur préféré, consultez les durées et prix en toute transparence.
              </p>
            </div>

            {/* Feature 4: Payment & Reminders */}
            <div className="glassmorphism-card rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Paiement & rappels</h3>
              <p className="text-muted-foreground">
                Acompte ou tarif complet, rappels automatiques par SMS, email ou WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Comment ça marche
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en 3 étapes pour réserver votre rendez-vous
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Choisissez service & date</h3>
              <p className="text-muted-foreground">
                Sélectionnez votre service préféré et trouvez le créneau qui vous convient parmi les disponibilités en temps réel.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Validez & payez</h3>
              <p className="text-muted-foreground">
                Confirmez vos informations et procédez au paiement sécurisé. Acompte ou règlement complet selon vos préférences.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Recevez confirmation & rappels</h3>
              <p className="text-muted-foreground">
                Confirmation instantanée par email/SMS. Rappels automatiques pour ne jamais oublier votre rendez-vous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Prêt à moderniser votre salon ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez les centaines de salons qui font confiance à SalonPilot pour gérer leurs rendez-vous
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <GlassmorphismButton 
              onClick={handleLoginClick}
              className="btn-primary px-8 py-4 text-white font-semibold text-lg"
              data-testid="button-start-free"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Commencer gratuitement
            </GlassmorphismButton>
            <GlassmorphismButton 
              onClick={handleLoginClick}
              className="btn-secondary px-8 py-4 text-primary font-semibold text-lg"
              data-testid="button-demo"
            >
              <Phone className="mr-2 h-5 w-5" />
              Demander une démo
            </GlassmorphismButton>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-primary h-5 w-5" />
              <span>Essai gratuit 14 jours</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="text-primary h-5 w-5" />
              <span>Aucune carte requise</span>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="text-primary h-5 w-5" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Scissors className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold">SalonPilot</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                La plateforme de réservation intelligente qui révolutionne la gestion des salons de coiffure.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Tarifs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Support</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Mentions légales</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">CGU</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 SalonPilot. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
