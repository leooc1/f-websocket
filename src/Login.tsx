import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { UserSession } from "./App";

interface LoginProps {
  onLogin: (session: UserSession) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, [API_URL]);
  const socketRef = io(`${API_URL}`, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Nome de usuário é obrigatório");
      return;
    }

    setLoading(true);
    setError("");

    socketRef.emit(
      "createRoom",
      { username: username.trim() },
      (response: { success: boolean; roomId?: string; error?: string }) => {
        setLoading(false);
        if (response.success && response.roomId) {
          onLogin({ username: username.trim(), roomId: response.roomId });
        } else {
          setError(response.error || "Erro ao criar sala");
          socketRef.disconnect();
        }
      },
    );
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Nome de usuário é obrigatório");
      return;
    }
    if (!roomId.trim()) {
      setError("ID da sala é obrigatório");
      return;
    }

    setLoading(true);
    setError("");

    socketRef.emit(
      "joinRoom",
      { username: username.trim(), roomId: roomId.trim() },
      (response: { success: boolean; error?: string }) => {
        setLoading(false);
        if (response.success) {
          onLogin({ username: username.trim(), roomId: roomId.trim() });
        } else {
          setError(response.error || "Erro ao entrar na sala");
          socketRef.disconnect();
        }
      },
    );
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="login-neumorphism max-w-md w-full">
        <h1 className="text-center font-bold mb-4">CHAT POR SALA</h1>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {!isCreatingRoom && !isJoiningRoom ? (
          <form className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreatingRoom(true);
                setError("");
                setUsername("");
                setRoomId("");
              }}
              className="text-mauve-400 hover:text-mauve-800 bg-mauve-800 hover:bg-mauve-500 px-2 py-1 text-xl rounded-lg transition-all duration-200 cursor-pointer"
            >
              CRIAR SALA
            </button>
            <button
              type="button"
              onClick={() => {
                setIsJoiningRoom(true);
                setError("");
                setUsername("");
                setRoomId("");
              }}
              className="text-mauve-400 hover:text-mauve-800 bg-mauve-800 hover:bg-mauve-500 px-2 py-1 text-xl rounded-lg transition-all duration-200 cursor-pointer"
            >
              ENTRAR NA SALA
            </button>
          </form>
        ) : isCreatingRoom ? (
          <form onSubmit={handleCreateRoom} className="flex flex-col gap-3">
            <input
              className="input-neumorphism"
              type="text"
              placeholder="Seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-mauve-400 hover:text-mauve-800 bg-mauve-800 hover:bg-mauve-500 px-2 py-1 text-xl rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Criando..." : "CRIAR"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingRoom(false);
                  setUsername("");
                  setRoomId("");
                  setError("");
                }}
                className="flex-1 text-mauve-400 hover:text-mauve-800 bg-mauve-800 hover:bg-mauve-500 px-2 py-1 text-xl rounded-lg transition-all duration-200 cursor-pointer"
              >
                VOLTAR
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
            <input
              className="input-neumorphism"
              type="text"
              placeholder="Seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              disabled={loading}
            />
            <input
              className="input-neumorphism"
              type="text"
              placeholder="ID da sala"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-mauve-400 hover:text-mauve-800 bg-mauve-800 hover:bg-mauve-500 px-2 py-1 text-xl rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Entrando..." : "ENTRAR"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsJoiningRoom(false);
                  setUsername("");
                  setRoomId("");
                  setError("");
                }}
                className="flex-1 text-mauve-400 hover:text-mauve-800 bg-mauve-800 hover:bg-mauve-500 px-2 py-1 text-xl rounded-lg transition-all duration-200 cursor-pointer"
              >
                VOLTAR
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
