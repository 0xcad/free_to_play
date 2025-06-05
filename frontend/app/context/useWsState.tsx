import { useState, useRef, useEffect } from "react";

import { wsBaseUrl } from '~/constants/api';

/* Websockets
 * Websockets all get sent with `app`, `action`, and `data`
 * App is what model this is, like `play.PlayInstance`, or `chat.ChatMessage`, or just `chat`
 * Action is what's happening. This could be `created`, `updated`, `deleted`, or something else
 * Data is a dictionary of data, could be anything
 *
 * With this setup, on any view I can do `ws.registerHandler('app.action', fn)`
 * And then whenever a websocket comes in that matches `app.action`, I execute `fn(data)`
 */

type Handler = (payload: any) => void;

export interface WsState {
  registerHandler: (key: string, fn: Handler) => void;
  unregisterHandler: (key: string, fn: Handler) => void;
  isConnected: boolean;
}

export function useWsState(): WsState {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const backoffRef = useRef<number>(1000); // start with 1s
  const isUnmountedRef = useRef<boolean>(false);


  // handlersMap: key → Set of callback functions
  const handlersRef = useRef<Record<string, Set<Handler>>>({});

  // Expose connection status
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // connect to ws
  const connect = () => {
    if (isUnmountedRef.current) {
      return;
    }

    const socket = new WebSocket(wsBaseUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("[WS] Connected");
      setIsConnected(true);

      // Reset backoff on successful connection
      backoffRef.current = 1000;
    };

    socket.onmessage = (event: MessageEvent) => {
      let payload: Payload;
      try {
        payload = JSON.parse(event.data);
      } catch (err) {
        console.error("[WS] Failed to parse message:", event.data);
        return;
      }

      // Primary key: "<app>.<action>"
      const primaryKey = `${payload.app}.${payload.action}`;

      // Call any handlers registered to primary key
      const primaryHandlers = handlersRef.current[primaryKey];
      if (primaryHandlers) {
        primaryHandlers.forEach((fn) => {
          try {
            fn(payload.data);
          } catch (handlerErr) {
            console.error("[WS] Handler error:", handlerErr);
          }
        });
      }
      // TODO: if needed, if I want to have handlers run on, say, just "app", I can do that here too
      // currently idk if I need that though...
    };

    socket.onerror = (err) => {
      console.error("[WS] Error:", err);
    };

    // attempt to reconnect if socket gets disconnected
    socket.onclose = (event) => {
      console.warn(
        `[WS] Disconnected (code=${event.code}). Scheduling reconnect...`
      );
      setIsConnected(false);

      // If component unmounted, do not attempt reconnect
      if (isUnmountedRef.current) {
        return;
      }

      // Exponential backoff: double up to max of 30s (30000ms)
      const timeout = backoffRef.current;
      backoffRef.current = Math.min(backoffRef.current * 2, 30000);

      reconnectTimerRef.current = window.setTimeout(() => {
        console.log("[WS] Attempting to reconnect...");
        connect();
      }, timeout);
    };
  };

  // On mount: initialize WebSocket
  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      // Mark unmounted, clear any pending reconnection
      isUnmountedRef.current = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
      }
      // Close active socket
      socketRef.current?.close();
    };
  }, []);

  const registerHandler = (key: string, fn: Handler) => {
    if (!handlersRef.current[key]) {
      handlersRef.current[key] = new Set();
    }
    handlersRef.current[key].add(fn);
  };

  const unregisterHandler = (key: string, fn: Handler) => {
    const set = handlersRef.current[key];
    if (!set) return;
    set.delete(fn);
    if (set.size === 0) {
      delete handlersRef.current[key];
    }
  };

  return { registerHandler, unregisterHandler, isConnected };
}
