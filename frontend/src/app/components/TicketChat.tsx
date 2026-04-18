import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ChatMessage {
  id: string;
  ticketId: string;
  sender: "user" | "tech";
  senderName: string;
  message: string;
  timestamp: string;
}

interface TicketChatProps {
  ticketId: string;
  senderType: "user" | "tech";
  senderName: string;
}

export default function TicketChat({ ticketId, senderType, senderName }: TicketChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
    }, 2000);
    return () => clearInterval(interval);
  }, [ticketId]);

  // Prevenir que el input se pierda durante re-renders
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const chatKey = `chat_${ticketId}`;
    const stored = localStorage.getItem(chatKey);
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      ticketId,
      sender: senderType,
      senderName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const chatKey = `chat_${ticketId}`;
    const updatedMessages = [...messages, message];
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border-2 border-neutral-200">
      <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200">
        <h3 className="text-sm font-medium">Chat con {senderType === "user" ? "Técnico" : "Usuario"}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-neutral-400 py-8">
              No hay mensajes aún
            </p>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender === senderType;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] ${
                      isOwn
                        ? "bg-red-600 text-white"
                        : "bg-neutral-200 text-neutral-900"
                    } px-3 py-2 rounded`}
                  >
                    <p className="text-xs opacity-75 mb-1">{msg.senderName}</p>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-3 border-t border-neutral-200 bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            autoComplete="off"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
