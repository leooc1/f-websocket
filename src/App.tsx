import { useState } from "react";
import Login from "./Login";
import { Chat } from "./Chat";

export interface UserSession {
  username: string;
  roomId: string;
}

function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  if (!userSession) {
    return (
      <section className="w-screen h-screen bg-mauve-400">
        <Login onLogin={setUserSession} />
      </section>
    );
  }

  return (
    <section className="w-screen h-screen bg-mauve-400 flex">
      <div className="w-full h-full bg-amber-200"></div>
      <Chat userSession={userSession} onLogout={() => setUserSession(null)} />
    </section>
  );
}

export default App;
