import { useState, useEffect } from "react";
import { Check, Clock, Loader, Play } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: "pending" | "in-progress" | "resolved";
  prioridad: "high" | "medium" | "low";
  tecnico?: string;
  descripcion_resolucion?: string;
}

export default function TechPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // 🔄 Cargar tickets
  const loadTickets = () => {
    fetch("http://192.168.1.42:3000/tickets")
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🟡 EN PROCESO
  const handleStartProgress = async (ticket: Ticket) => {
    const tecnico = prompt("Nombre del técnico:");
    if (!tecnico) return;

    try {
      await fetch(`http://192.168.1.42:3000/tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estado: "in-progress",
          tecnico: tecnico,
          descripcion: null
        })
      });

      toast.success("Ticket en proceso");
      loadTickets();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  // ✅ RESOLVER
  const handleResolve = async (ticket: Ticket) => {
    const tecnico = prompt("Nombre del técnico:");
    const descripcion = prompt("Descripción de la solución:");

    if (!tecnico || !descripcion) return;

    try {
      await fetch(`http://192.168.1.42:3000/tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          estado: "resolved",
          tecnico: tecnico,
          descripcion: descripcion
        })
      });

      toast.success("Ticket resuelto");
      loadTickets();
    } catch (error) {
      toast.error("Error al resolver");
    }
  };

  // 🎯 FILTROS POR ESTADO
  const pending = tickets.filter(t => t.estado === "pending");
  const inProgress = tickets.filter(t => t.estado === "in-progress");
  const resolved = tickets.filter(t => t.estado === "resolved");

  const priorityColors: any = {
    high: "bg-red-600",
    medium: "bg-yellow-500",
    low: "bg-gray-400"
  };

  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <div className="border p-4 mb-3">
      <div className="flex justify-between">
        <h3>{ticket.titulo}</h3>
        <div className={`w-3 h-3 rounded-full ${priorityColors[ticket.prioridad]}`} />
      </div>

      <p className="text-sm text-gray-600">{ticket.descripcion}</p>

      {ticket.tecnico && (
        <p className="text-sm text-blue-600">
          Técnico: {ticket.tecnico}
        </p>
      )}

      {ticket.descripcion_resolucion && (
        <p className="text-sm italic">
          {ticket.descripcion_resolucion}
        </p>
      )}

      <div className="flex gap-2 mt-2">
        {ticket.estado === "pending" && (
          <>
            <Button onClick={() => handleStartProgress(ticket)}>
              <Play className="w-4 h-4 mr-2" />
              En proceso
            </Button>

            <Button onClick={() => handleResolve(ticket)}>
              <Check className="w-4 h-4 mr-2" />
              Resolver
            </Button>
          </>
        )}

        {ticket.estado === "in-progress" && (
          <Button onClick={() => handleResolve(ticket)}>
            Resolver
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl">Panel Técnico</h1>

      {/* PENDIENTES */}
      <div>
        <h2 className="text-lg mb-2">Pendientes</h2>
        {pending.length === 0 ? <p>No hay</p> :
          pending.map(t => <TicketCard key={t.id} ticket={t} />)
        }
      </div>

      {/* EN PROCESO */}
      <div>
        <h2 className="text-lg mb-2">En proceso</h2>
        {inProgress.length === 0 ? <p>No hay</p> :
          inProgress.map(t => <TicketCard key={t.id} ticket={t} />)
        }
      </div>

      {/* RESUELTOS */}
      <div>
        <h2 className="text-lg mb-2">Resueltos</h2>
        {resolved.length === 0 ? <p>No hay</p> :
          resolved.map(t => <TicketCard key={t.id} ticket={t} />)
        }
      </div>

    </div>
  );
}