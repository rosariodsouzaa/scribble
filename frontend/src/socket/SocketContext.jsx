import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

// Creates exactly ONE socket for the app's lifetime (synchronously, via a ref, so
// there's no null-flash) and provides it above the router so it survives navigation.
export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  if (!socketRef.current) {
    socketRef.current = io({ path: "/socket.io" });
  }
  useEffect(() => {
    const s = socketRef.current;
    return () => s.close();
  }, []);
  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
