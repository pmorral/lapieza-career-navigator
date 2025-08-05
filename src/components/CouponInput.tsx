import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CouponInputProps {
  onCouponApplied: (coupon: any) => void;
  appliedCoupon?: any;
}

export const CouponInput = ({ onCouponApplied, appliedCoupon }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Ingresa un código de cupón");
      return;
    }

    setIsValidating(true);
    try {
      // Check if coupon exists and is valid
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        toast.error("Código de cupón no válido");
        return;
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error("Este cupón ha expirado");
        return;
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast.error("Este cupón ha alcanzado su límite de uso");
        return;
      }

      // Check if user has already used this coupon
      const { data: existingUse } = await supabase
        .from('coupon_uses')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (existingUse) {
        toast.error("Ya has usado este cupón");
        return;
      }

      toast.success("¡Cupón aplicado correctamente!");
      onCouponApplied(coupon);
      setCouponCode("");
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error("Error al validar el cupón");
    } finally {
      setIsValidating(false);
    }
  };

  if (appliedCoupon) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {appliedCoupon.code}
              </Badge>
            </div>
            <span className="text-sm text-green-700">
              {appliedCoupon.discount_type === 'free' ? 'Acceso gratuito aplicado' : appliedCoupon.description}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          ¿Tienes un cupón?
        </CardTitle>
        <CardDescription>
          Ingresa tu código de cupón para obtener descuentos o acceso gratuito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Ej: ACADEMY_100"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
          />
          <Button 
            onClick={validateCoupon} 
            disabled={isValidating}
            variant="outline"
          >
            {isValidating ? "Validando..." : "Aplicar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};