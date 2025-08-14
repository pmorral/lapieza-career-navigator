import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Key, ArrowLeft, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrialEmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export const TrialEmailVerification = ({ email, onVerificationSuccess, onBack }: TrialEmailVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-verification-code", {
        body: { email, type: "trial_interview" }
      });

      if (error) {
        toast.error(`Error al enviar código: ${error.message}`);
        return;
      }

      toast.success("Código de verificación enviado a tu email");
      setCodeSent(true);
      setCountdown(60); // 60 seconds countdown
      
      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      toast.error("Error al enviar código de verificación");
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error("Por favor ingresa el código de verificación");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-code", {
        body: { email, code: verificationCode, type: "trial_interview" }
      });

      if (error) {
        toast.error(`Error al verificar código: ${error.message}`);
        return;
      }

      toast.success("¡Email verificado exitosamente!");
      onVerificationSuccess();

    } catch (error) {
      toast.error("Error al verificar el código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    sendVerificationCode();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl">Verifica tu email</CardTitle>
        <CardDescription>
          Hemos enviado un código de verificación a
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!codeSent ? (
          <Button 
            onClick={sendVerificationCode} 
            disabled={isSendingCode}
            className="w-full"
          >
            {isSendingCode ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Enviando código...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Enviar código de verificación
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Código de verificación</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Ingresa el código de 6 dígitos enviado a tu email
              </p>
            </div>

            <Button 
              onClick={verifyCode} 
              disabled={isLoading || !verificationCode.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar código
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="text-sm"
              >
                {countdown > 0 ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Reenviar en {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reenviar código
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
