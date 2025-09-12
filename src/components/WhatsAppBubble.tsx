import { MessageCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WhatsAppBubble() {
  const handleWhatsAppClick = () => {
    const whatsappUrl =
      "https://wa.me/+523337872943?text=Hola%20equipo%20de%20Academy%2C%20quiero%20hablar%20con%20mi%20Career%20Coach";
    window.open(whatsappUrl, "_blank");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleWhatsAppClick}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg"
        >
          <p className="text-sm font-medium">Habla con tu Career Coach</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
