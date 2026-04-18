import { useState, useEffect } from "react";
import {
  AlertCircle,
  Wifi,
  Clock,
  Laptop,
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: "high" | "medium" | "low";
  categoria: string;
  fecha: string;
}

const errorTypes = [
  { id: "slow", label: "Equipo lento", icon: Clock },
  { id: "no-internet", label: "Sin internet", icon: Wifi },
  { id: "hardware", label: "Problema de hardware", icon: Laptop },
  { id: "other", label: "Otro problema", icon: AlertCircle },
];

export default function UserTicket() {
  const [pcId, setPcId] = useState("");
  const [selectedError, setSelectedError] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // 🔄 cargar tickets desde backend
  const loadTickets = () => {
    fetch("http://192.168.1.42:3000/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // ➕ enviar ticket
  const handleSubmit = async () => {
    if (!pcId.trim()) {
      toast.error("Ingresa el ID del equipo");
      return;
    }

    if (!selectedError) {
      toast.error("Selecciona el tipo de problema");
      return;
    }

    if (priority === "high" && !message.trim()) {
      toast.error("Prioridad alta requiere descripción");
      return;
    }

    try {
      await fetch("http://192.168.1.42:3000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: selectedError,
          descripcion: message,
          estado: "pending",
          prioridad: priority,
          categoria: "general",
        }),
      });

      toast.success("Ticket enviado");

      loadTickets();

      setSelectedError("");
      setMessage("");
      setPriority("medium");
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar ticket");
    }
  };

  const priorityLabels = {
    high: { label: "Alta", color: "bg-red-600" },
    medium: { label: "Media", color: "bg-yellow-500" },
    low: { label: "Baja", color: "bg-gray-400" },
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl">Soporte Técnico</h1>

          {/* ID PC */}
          <div>
            <Label>ID del equipo</Label>
            <Input
              value={pcId}
              onChange={(e) => setPcId(e.target.value)}
              placeholder="Ej: PC-001"
            />
          </div>

          {/* PRIORIDAD */}
          <div>
            <Label className="mb-2 block">Prioridad</Label>
            <div className="grid grid-cols-3 gap-3">
              {(["high", "medium", "low"] as const).map((p) => {
                const selected = priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`p-3 border-2 ${
                      selected
                        ? "border-black bg-gray-100"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mx-auto mb-1 ${priorityLabels[p].color}`}
                    />
                    {priorityLabels[p].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIPO ERROR */}
          <div>
            <Label className="mb-2 block">Tipo de problema</Label>
            <div className="grid grid-cols-2 gap-3">
              {errorTypes.map((error) => {
                const Icon = error.icon;
                return (
                  <button
                    key={error.id}
                    onClick={() => setSelectedError(error.id)}
                    className={`p-3 border ${
                      selectedError === error.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Icon className="mx-auto mb-1" />
                    {error.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MENSAJE */}
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe el problema..."
            />
          </div>

          <Button onClick={handleSubmit}>
            Enviar Ticket
          </Button>
        </div>

        {/* LISTA */}
        <div>
          <h2 className="text-xl mb-4">Tickets</h2>

          {tickets.length === 0 ? (
            <p>No hay tickets</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border p-3">
                  <div className="flex justify-between">
                    <span>{ticket.titulo}</span>
                    <Badge>{ticket.estado}</Badge>
                  </div>

                  <p className="text-sm text-gray-600">
                    {ticket.descripcion}
                  </p>

                  <div
                    className={`w-3 h-3 rounded-full mt-2 ${priorityLabels[ticket.prioridad].color}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}