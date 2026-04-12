import { useState, useEffect } from "react";
import {
  AlertCircle,
  Wifi,
  Clock,
  Laptop,
  CheckCircle,
  Loader,
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import TicketChat from "./TicketChat";

interface Ticket {
  id: string;
  pcId: string;
  pcName: string;
  errorType: string;
  message: string;
  timestamp: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "high" | "medium" | "low";
  technicianName?: string;
  resolutionDescription?: string;
  inProgressBy?: string;
  inProgressAt?: string;
  resolvedAt?: string;
}

const errorTypes = [
  { id: "slow", label: "Equipo lento", icon: Clock },
  { id: "no-internet", label: "Sin internet", icon: Wifi },
  {
    id: "hardware",
    label: "Problema de hardware",
    icon: Laptop,
  },
  { id: "other", label: "Otro problema", icon: AlertCircle },
];

export default function UserTicket() {
  const [pcId, setPcId] = useState("");
  const [selectedError, setSelectedError] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<
    "high" | "medium" | "low"
  >("medium");
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Simula obtener el ID del PC desde el sistema
    const savedPcId = localStorage.getItem("pc_id");
    if (savedPcId) {
      setPcId(savedPcId);
      loadMyTickets(savedPcId);
    }

    const interval = setInterval(() => {
      if (pcId) loadMyTickets(pcId);
    }, 3000);

    return () => clearInterval(interval);
  }, [pcId]);

  const loadMyTickets = (currentPcId: string) => {
    const tickets = JSON.parse(
      localStorage.getItem("tickets") || "[]",
    );
    const filtered = tickets
      .filter(
        (t: Ticket) =>
          t.pcId === currentPcId && t.status !== "resolved",
      )
      .map((t: Ticket) => ({
        ...t,
        priority: t.priority || "medium",
      }));
    setMyTickets(filtered);
  };

  const handleSubmit = () => {
    if (!pcId.trim()) {
      toast.error("Ingresa el ID del equipo");
      return;
    }
    if (!selectedError) {
      toast.error("Selecciona el tipo de problema");
      return;
    }

    if (priority === "high" && !message.trim()) {
      toast.error("Prioridad Alta requiere una descripción");
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      pcId: pcId.trim(),
      pcName: navigator.userAgent,
      errorType: selectedError,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      status: "pending",
      priority: priority,
    };

    // Guardar en localStorage (temporal)
    const tickets = JSON.parse(
      localStorage.getItem("tickets") || "[]",
    );
    tickets.push(ticket);
    localStorage.setItem("tickets", JSON.stringify(tickets));

    // Guardar PC ID
    localStorage.setItem("pc_id", pcId.trim());

    toast.success("Ticket enviado correctamente");
    setSelectedError("");
    setMessage("");
    setPriority("medium");
    loadMyTickets(pcId.trim());
  };

  const errorTypeLabels: Record<string, string> = {
    slow: "Equipo lento",
    "no-internet": "Sin internet",
    hardware: "Problema de hardware",
    other: "Otro problema",
  };

  const priorityLabels = {
    high: { label: "Alta", color: "bg-red-600" },
    medium: { label: "Media", color: "bg-yellow-500" },
    low: { label: "Baja", color: "bg-neutral-400" },
  };

  const statusLabels = {
    pending: {
      label: "Pendiente",
      icon: Clock,
      color: "text-neutral-600",
    },
    "in-progress": {
      label: "En proceso",
      icon: Loader,
      color: "text-yellow-600",
    },
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-12">
            <h1 className="text-[3rem] tracking-tight mb-2">
              Soporte Técnico
            </h1>
            <p className="text-neutral-600">
              Reporta problemas con tu equipo
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <Label
                htmlFor="pcId"
                className="text-base mb-2 block"
              >
                ID del Equipo
              </Label>
              <Input
                id="pcId"
                value={pcId}
                onChange={(e) => setPcId(e.target.value)}
                placeholder="Ej: PC-001"
                className="h-12 text-base border-neutral-300 focus:border-black"
              />
            </div>

            <div>
              <Label className="text-base mb-4 block">
                Prioridad
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {(["high", "medium", "low"] as const).map(
                  (p) => {
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`flex items-center justify-center gap-2 p-3 border-2 transition-all ${
                          isSelected
                            ? "border-black bg-neutral-50"
                            : "border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${priorityLabels[p].color}`}
                        />
                        <span className="text-sm">
                          {priorityLabels[p].label}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
              {priority === "high" && (
                <p className="text-sm text-red-600 mt-2">
                  * Requiere descripción obligatoria
                </p>
              )}
            </div>

            <div>
              <Label className="text-base mb-4 block">
                Tipo de Problema
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {errorTypes.map((error) => {
                  const Icon = error.icon;
                  const isSelected = selectedError === error.id;
                  return (
                    <button
                      key={error.id}
                      onClick={() => setSelectedError(error.id)}
                      className={`flex items-center gap-4 p-4 border-2 transition-all ${
                        isSelected
                          ? "border-red-600 bg-red-50"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected
                            ? "text-red-600"
                            : "text-neutral-600"
                        }`}
                      />
                      <span
                        className={`text-base ${
                          isSelected
                            ? "text-red-600 font-medium"
                            : "text-neutral-900"
                        }`}
                      >
                        {error.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label
                htmlFor="message"
                className="text-base mb-2 block"
              >
                Mensaje{" "}
                {priority === "high" && (
                  <span className="text-red-600">*</span>
                )}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe el problema con más detalle..."
                className="min-h-32 text-base border-neutral-300 focus:border-black resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-14 text-base bg-red-600 hover:bg-red-700 text-white"
            >
              Enviar Ticket
            </Button>
          </div>
        </div>

        {/* Notificaciones de tickets activos */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-xl mb-4">
              Mis Tickets Activos
            </h2>
            {myTickets.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-neutral-200">
                <CheckCircle className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">
                  Sin tickets activos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.map((ticket) => {
                  const StatusIcon =
                    statusLabels[ticket.status]?.icon || Clock;
                  const statusInfo =
                    statusLabels[ticket.status];
                  const isInProgress =
                    ticket.status === "in-progress";
                  return (
                    <div key={ticket.id}>
                      <div
                        className={`border-2 p-4 transition-all ${
                          isInProgress
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-neutral-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                priorityLabels[ticket.priority]
                                  .color
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {
                                errorTypeLabels[
                                  ticket.errorType
                                ]
                              }
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusInfo?.color} ${
                              isInProgress
                                ? "animate-pulse"
                                : ""
                            }`}
                          >
                            <StatusIcon
                              className={`w-3 h-3 mr-1 ${
                                isInProgress
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            {statusInfo?.label}
                          </Badge>
                        </div>
                        {ticket.message && (
                          <p className="text-xs text-neutral-600 mb-2">
                            {ticket.message}
                          </p>
                        )}
                        {ticket.inProgressBy && (
                          <p className="text-xs text-yellow-700 font-medium">
                            Atendiendo: {ticket.inProgressBy}
                          </p>
                        )}
                        <p className="text-xs text-neutral-400 mt-2">
                          {new Date(
                            ticket.timestamp,
                          ).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Chat - Siempre abierto cuando está en proceso */}
                      {isInProgress && (
                        <div className="mt-2 h-96">
                          <TicketChat
                            ticketId={ticket.id}
                            senderType="user"
                            senderName={ticket.pcId}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
