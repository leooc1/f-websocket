import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { UserSession } from "./App";

interface Message {
  user: string;
  text: string;
  timestamp: string;
}

interface ChatProps {
  userSession: UserSession;
  onLogout: () => void;
}

export function Chat({ userSession, onLogout }: ChatProps) {
  const API_URL = import.meta.env.API_URL;
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializa a conexão WebSocket
  useEffect(() => {
    socketRef.current = io(`${API_URL}` , {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("Conectado ao servidor WebSocket");
      setIsConnected(true);

      // Entra na sala com username e roomId
      socketRef.current?.emit("joinRoom", {
        username: userSession.username,
        roomId: userSession.roomId,
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Desconectado do servidor");
      setIsConnected(false);
    });

    socketRef.current.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("messageHistory", (history: Message[]) => {
      setMessages(history);
    });

    socketRef.current.on("roomUsers", (users: string[]) => {
      console.log("Usuários na sala:", users);
      setConnectedUsers(users);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userSession]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() && socketRef.current && isConnected) {
      socketRef.current.emit("sendMessage", {
        text: inputValue.trim(),
        roomId: userSession.roomId,
      });
      setInputValue("");
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(userSession.roomId);
    alert("ID da sala copiado para a área de transferência!");
  };

  return (
    <div className="fixed bottom-0 right-0 z-50">
      {/* Botão flutuante para abrir/fechar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="border-4 border-mauve-700 rounded-xl p-2 bg-mauve-400 hover:bg-mauve-300 cursor-pointer transition-all duration-200 shadow-lg absolute bottom-4 right-4"
          title="Abrir chat"
        >
          <svg className="w-8 h-8 fill-mauve-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="">
            <path d="M10.0014 14.6757C10.0011 14.6551 10.001 14.6345 10.001 14.6138C10.001 12.1055 12.0175 9.99564 14.7539 9.38092C14.3904 7.07873 11.9602 5.19995 8.90098 5.19995C5.58037 5.19995 3.00098 7.41344 3.00098 9.9793C3.00098 10.9487 3.36131 11.88 4.04082 12.6781C4.0728 12.7157 4.12443 12.7717 4.19342 12.8427C4.78537 13.4517 5.13709 14.2457 5.19546 15.0805C5.90857 14.6683 6.74285 14.5123 7.55832 14.6392C7.72416 14.665 7.85986 14.6847 7.96345 14.6982C8.27111 14.7383 8.58419 14.7586 8.90098 14.7586C9.27825 14.7586 9.64595 14.7301 10.0014 14.6757ZM10.4581 16.627C9.95467 16.7133 9.43399 16.7586 8.90098 16.7586C8.49441 16.7586 8.09502 16.7323 7.70499 16.6815C7.58312 16.6656 7.4317 16.6436 7.25073 16.6154C6.87693 16.5572 6.49436 16.6321 6.1713 16.8268L4.26653 17.9745C4.12052 18.0646 3.94891 18.1057 3.77733 18.0916C3.33814 18.0554 3.01178 17.6744 3.04837 17.2405L3.19859 15.4596C3.23664 15.0086 3.07664 14.5632 2.75931 14.2367C2.66182 14.1364 2.5814 14.0491 2.51802 13.9747C1.56406 12.8542 1.00098 11.4732 1.00098 9.9793C1.00098 6.23517 4.53793 3.19995 8.90098 3.19995C12.9601 3.19995 16.3041 5.82699 16.7504 9.20788C20.1225 9.36136 22.801 11.723 22.801 14.6138C22.801 15.8068 22.3448 16.9097 21.572 17.8044C21.5206 17.8639 21.4555 17.9336 21.3765 18.0137C21.1194 18.2744 20.9898 18.6301 21.0206 18.9903L21.1423 20.4125C21.172 20.759 20.9076 21.0632 20.5518 21.0921C20.4128 21.1034 20.2738 21.0706 20.1555 20.9986L18.6124 20.0821C18.3506 19.9266 18.0407 19.8668 17.7379 19.9133C17.5913 19.9358 17.4686 19.9533 17.3699 19.966C17.0539 20.0066 16.7303 20.0277 16.401 20.0277C13.7074 20.0277 11.4025 18.6201 10.4581 16.627ZM17.4346 17.9364C18.0019 17.8494 18.5793 17.911 19.1105 18.1111C19.2492 17.5503 19.5373 17.0304 19.9524 16.6094C20.0027 16.5585 20.0388 16.5198 20.0584 16.4971C20.5467 15.9318 20.801 15.2839 20.801 14.6138C20.801 12.8095 18.8983 11.2 16.401 11.2C13.9037 11.2 12.001 12.8095 12.001 14.6138C12.001 16.4181 13.9037 18.0277 16.401 18.0277C16.6424 18.0277 16.8809 18.0124 17.115 17.9823C17.1957 17.972 17.3029 17.9566 17.4346 17.9364Z" />
          </svg>
        </button>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div className="bg-mauve-900 border-2 border-mauve-700 rounded-xl shadow-2xl flex flex-col w-96 max-w-screen h-96 md:mb-4 md:mr-4" >
          {/* Header */}
          <div className="bg-mauve-800 p-4 border-b border-mauve-700 rounded-t-lg">
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-mauve-300">Chat - {userSession.roomId}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyRoomId}
                  className="text-mauve-300 hover:text-mauve-100 transition-colors p-1"
                  title="Copiar ID da sala"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-mauve-300 hover:text-mauve-100 transition-colors p-1"
                  title="Fechar chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-xs text-mauve-200 flex items-center gap-3 flex-wrap">
              <span style={{ color: isConnected ? "#4ade80" : "#ef4444" }}>● {isConnected ? "Conectado" : "Desconectado"}</span>
              <span>|</span>
              <span>Online: {connectedUsers.length}</span>
              <span>|</span>
              <span>{userSession.username}</span>
            </div>
          </div>

          {/* Mensagens */}
          <ul className="flex-1 overflow-y-auto p-4 bg-mauve-800 space-y-3">
            {messages.length === 0 ? (
              <li className="text-center text-mauve-300 mt-8">
                Nenhuma mensagem ainda!
              </li>
            ) : (
              messages.map((msg, idx) => (
                <li key={idx} className="mb-3 last:mb-0 bg-mauve-300 rounded-xl p-2">
                  <div className="flex justify-between items-baseline gap-2">
                    <strong className="text-mauve-900 text-sm">{msg.user}:</strong>
                    <span className="text-xs text-mauve-900">
                      {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-mauve-800 mt-1 text-sm ml-4 wrap-break-word whitespace-pre-wrap">{msg.text}</div>
                </li>
              ))
            )}
            <div ref={messagesEndRef} />
          </ul>

          {/* Input de Mensagem */}
          <form onSubmit={handleSendMessage} className="bg-mauve-800 p-3 border-t border-mauve-700 rounded-b-lg flex gap-2">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!isConnected}
              className="flex-1 bg-mauve-700 border border-mauve-600 rounded px-3 py-2 text-mauve-100 placeholder-mauve-400 focus:outline-none focus:border-mauve-500 text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isConnected || !inputValue.trim()}
              className="bg-mauve-600 hover:bg-mauve-500 text-mauve-900 font-bold px-3 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
