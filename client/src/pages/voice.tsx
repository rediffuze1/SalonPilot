import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Brain, Clock, Shield } from "lucide-react";
import Navigation from "@/components/navigation";

export default function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'ai', message: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript("Écoute en cours...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // In a real implementation, this would:
    // 1. Send audio to speech-to-text service
    // 2. Process the intent with AI
    // 3. Generate appropriate response
    // 4. Convert response to speech if needed

    // Mock processing for demo
    setTimeout(() => {
      const mockTranscript = "Je voudrais une coupe femme jeudi après-midi";
      const mockResponse = "Parfait ! J'ai 16:30 ou 17:15 pour une Coupe + Brushing (45 min). Lequel préférez-vous ?";
      
      setTranscript(mockTranscript);
      setConversation(prev => [
        ...prev,
        { type: 'user', message: mockTranscript },
        { type: 'ai', message: mockResponse }
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Réceptionniste IA Vocale
            </h1>
            <p className="text-lg text-muted-foreground">
              Réservez votre rendez-vous simplement en parlant
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Voice Interface */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="text-center">Interface Vocale</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                
                {/* Microphone Button */}
                <div className="relative inline-block">
                  <Button
                    size="lg"
                    className={`w-32 h-32 rounded-full text-white transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 voice-pulse' 
                        : 'bg-gradient-to-br from-primary to-accent hover:scale-105'
                    }`}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    data-testid="button-voice-record"
                  >
                    {isRecording ? (
                      <MicOff className="h-12 w-12" />
                    ) : (
                      <Mic className="h-12 w-12" />
                    )}
                  </Button>
                  
                  {/* Pulse animation rings */}
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse-ring opacity-20" />
                      <div className="absolute inset-2 bg-red-400 rounded-full animate-pulse-ring opacity-30" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    {isRecording ? "Relâchez pour arrêter" : "Appuyez et maintenez pour parler"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dites quelque chose comme: "Je voudrais une coupe demain après-midi"
                  </p>
                </div>

                {/* Current Transcript */}
                {transcript && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-foreground">Transcription:</p>
                    <p className="text-muted-foreground">{transcript}</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-sm text-muted-foreground">Traitement en cours...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation History */}
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conversation.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      Commencez à parler pour démarrer la conversation
                    </p>
                  ) : (
                    conversation.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          }`}
                          data-testid={`message-${message.type}-${index}`}
                        >
                          {message.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Brain className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Compréhension naturelle</h3>
                <p className="text-sm text-muted-foreground">
                  L'IA comprend le langage naturel et les nuances
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Réponse instantanée</h3>
                <p className="text-sm text-muted-foreground">
                  Temps de réponse &lt; 1.5 seconde
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">100% sécurisé</h3>
                <p className="text-sm text-muted-foreground">
                  Données chiffrées et conformes RGPD
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Example Commands */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Exemples de commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Réservations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>"Je voudrais une coupe femme carrée jeudi après-midi"</li>
                    <li>"As-tu une dispo demain avec Sarah pour un balayage ?"</li>
                    <li>"Réserve-moi un brushing vendredi matin"</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Modifications</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>"Décale mon rendez-vous de 16h à 17h"</li>
                    <li>"J'annule ma couleur de samedi"</li>
                    <li>"Peut-on changer de styliste ?"</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
