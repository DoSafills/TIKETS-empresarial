import { useState, useEffect } from "react";
import { Check, Clock, AlertCircle, Wifi, Laptop, ChevronLeft, Loader, Play, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useNavigate } from "react-router";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
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

const TECH_PASSWORD = "soporte2024";

export default function TechPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const navigate = useNavigate();

  // Filtros
  const [filterPcId, setFilterPcId] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTechnician, setFilterTechnician] = useState("");

  // Dialogs
  const [showInProgressDialog, setShowInProgressDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Formularios
  const [password, setPassword] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [resolutionDescription, setResolutionDescription] = useState("");

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadTickets = () => {
    const storedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");
    // Agregar valores por defecto para tickets antiguos
    const normalizedTickets = storedTickets.map((t: Ticket) => ({
      ...t,
      priority: t.priority || "medium",
      status: t.status === "resolved" ? "resolved" : t.status === "in-progress" ? "in-progress" : "pending",
    }));
    setTickets(normalizedTickets);
  };

  const handleStartProgress = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setPassword("");
    setTechnicianName("");
    setShowInProgressDialog(true);
  };

  const confirmStartProgress = () => {
    if (password !== TECH_PASSWORD) {
      toast.error("Contraseña incorrecta");
      return;
    }
    if (!technicianName.trim()) {
      toast.error("Ingresa el nombre del técnico");
      return;
    }

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket?.id
        ? {
            ...ticket,
            status: "in-progress" as const,
            inProgressBy: technicianName.trim(),
            inProgressAt: new Date().toISOString(),
          }
        : ticket
    );
    setTickets(updatedTickets);
    localStorage.setItem("tickets", JSON.stringify(updatedTickets));
    setShowInProgressDialog(false);
    toast.success("Ticket en proceso");
  };

  const handleResolveTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setPassword("");
    setTechnicianName(ticket.inProgressBy || "");
    setResolutionDescription("");
    setShowResolveDialog(true);
  };

  const confirmResolveTicket = () => {
    if (password !== TECH_PASSWORD) {
      toast.error("Contraseña incorrecta");
      return;
    }
    if (!technicianName.trim()) {
      toast.error("Ingresa el nombre del técnico");
      return;
    }
    if (!resolutionDescription.trim()) {
      toast.error("Ingresa la descripción de lo realizado");
      return;
    }

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket?.id
        ? {
            ...ticket,
            status: "resolved" as const,
            technicianName: technicianName.trim(),
            resolutionDescription: resolutionDescription.trim(),
            resolvedAt: new Date().toISOString(),
          }
        : ticket
    );
    setTickets(updatedTickets);
    localStorage.setItem("tickets", JSON.stringify(updatedTickets));

    // Borrar el chat al resolver el ticket
    if (selectedTicket?.id) {
      localStorage.removeItem(`chat_${selectedTicket.id}`);
    }

    setShowResolveDialog(false);
    toast.success("Ticket resuelto");
  };

  const filterTickets = (ticketList: Ticket[]) => {
    return ticketList.filter((ticket) => {
      const matchesPcId = !filterPcId || ticket.pcId.toLowerCase().includes(filterPcId.toLowerCase());
      const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
      const matchesTechnician =
        !filterTechnician ||
        ticket.technicianName?.toLowerCase().includes(filterTechnician.toLowerCase()) ||
        ticket.inProgressBy?.toLowerCase().includes(filterTechnician.toLowerCase());
      return matchesPcId && matchesPriority && matchesTechnician;
    });
  };

  const pendingTickets = filterTickets(tickets.filter((t) => t.status === "pending"));
  const inProgressTickets = filterTickets(tickets.filter((t) => t.status === "in-progress"));
  const resolvedTickets = filterTickets(tickets.filter((t) => t.status === "resolved"));

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const errorTypeLabels: Record<string, string> = {
    slow: "Equipo lento",
    "no-internet": "Sin internet",
    hardware: "Problema de hardware",
    other: "Otro problema",
  };

  const errorTypeIcons: Record<string, any> = {
    slow: Clock,
    "no-internet": Wifi,
    hardware: Laptop,
    other: AlertCircle,
  };

  const priorityLabels = {
    high: { label: "Alta", color: "bg-red-600" },
    medium: { label: "Media", color: "bg-yellow-500" },
    low: { label: "Baja", color: "bg-neutral-400" },
  };

  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const Icon = errorTypeIcons[ticket.errorType] || AlertCircle;
    const isPending = ticket.status === "pending";
    const isInProgress = ticket.status === "in-progress";
    const isResolved = ticket.status === "resolved";

    return (
      <div>
        <div
          className={`border-2 p-6 ${
            isPending
              ? "border-red-200 bg-red-50"
              : isInProgress
              ? "border-yellow-200 bg-yellow-50"
              : "border-neutral-200"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Icon
                className={`w-6 h-6 mt-1 ${
                  isPending ? "text-red-600" : isInProgress ? "text-yellow-600" : "text-neutral-400"
                }`}
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg">{errorTypeLabels[ticket.errorType]}</h3>
                  <div className={`w-2 h-2 rounded-full ${priorityLabels[ticket.priority].color}`} />
                </div>
                <p className="text-sm text-neutral-600">PC: {ticket.pcId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {isPending && (
                <>
                  <Button
                    onClick={() => handleStartProgress(ticket)}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white h-9"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    En camino
                  </Button>
                  <Button
                    onClick={() => handleResolveTicket(ticket)}
                    size="sm"
                    className="bg-black hover:bg-neutral-800 text-white h-9"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Resolver
                  </Button>
                </>
              )}
              {isInProgress && (
                <Button
                  onClick={() => handleResolveTicket(ticket)}
                  size="sm"
                  className="bg-black hover:bg-neutral-800 text-white h-9"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Resolver
                </Button>
              )}
            </div>
          </div>

          {ticket.message && <p className="text-neutral-700 mb-3 pl-9">{ticket.message}</p>}

          {ticket.inProgressBy && (
            <p className="text-sm text-yellow-700 pl-9 mb-2">
              Atendiendo: {ticket.inProgressBy}
            </p>
          )}

          {ticket.technicianName && (
            <p className="text-sm text-neutral-700 pl-9 mb-2">
              Resuelto por: {ticket.technicianName}
            </p>
          )}

          {ticket.resolutionDescription && (
            <p className="text-sm text-neutral-700 pl-9 mb-2 italic">
              "{ticket.resolutionDescription}"
            </p>
          )}

          <p className="text-xs text-neutral-500 pl-9">{formatDate(ticket.timestamp)}</p>
        </div>

        {/* Chat del técnico - Siempre abierto cuando está en proceso */}
        {isInProgress && (
          <div className="mt-2 h-96">
            <TicketChat
              ticketId={ticket.id}
              senderType="tech"
              senderName={ticket.inProgressBy || "Técnico"}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-neutral-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl">Panel Técnico</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full" />
              <span className="text-sm">{pendingTickets.length} pendientes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full" />
              <span className="text-sm">{inProgressTickets.length} en proceso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neutral-400 rounded-full" />
              <span className="text-sm">{resolvedTickets.length} resueltos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 border-2 border-neutral-200 bg-neutral-50">
          <div>
            <Label className="text-sm mb-2 block">Filtrar por PC</Label>
            <Input
              placeholder="Buscar ID de equipo..."
              value={filterPcId}
              onChange={(e) => setFilterPcId(e.target.value)}
              className="h-10"
            />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Filtrar por Prioridad</Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block">Filtrar por Técnico</Label>
            <Input
              placeholder="Buscar técnico..."
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-8 bg-neutral-100">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white">
              Pendientes ({pendingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:bg-white">
              En Proceso ({inProgressTickets.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-white">
              Resueltos ({resolvedTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingTickets.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600">No hay tickets pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTickets
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {inProgressTickets.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600">No hay tickets en proceso</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {resolvedTickets.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600">No hay tickets resueltos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog "En camino" */}
      <Dialog open={showInProgressDialog} onOpenChange={setShowInProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar ticket en proceso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tech-name-progress">Nombre del Técnico</Label>
              <Input
                id="tech-name-progress"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Tu nombre..."
              />
            </div>
            <div>
              <Label htmlFor="password-progress">Contraseña</Label>
              <Input
                id="password-progress"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña del técnico..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInProgressDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmStartProgress} className="bg-yellow-600 hover:bg-yellow-700">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Resolver */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tech-name-resolve">Nombre del Técnico</Label>
              <Input
                id="tech-name-resolve"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Tu nombre..."
              />
            </div>
            <div>
              <Label htmlFor="resolution-desc">Descripción de lo realizado *</Label>
              <Textarea
                id="resolution-desc"
                value={resolutionDescription}
                onChange={(e) => setResolutionDescription(e.target.value)}
                placeholder="Describe qué se realizó para resolver el problema..."
                className="min-h-24"
              />
            </div>
            <div>
              <Label htmlFor="password-resolve">Contraseña</Label>
              <Input
                id="password-resolve"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña del técnico..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmResolveTicket} className="bg-black hover:bg-neutral-800">
              Resolver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
