import { useEffect, useRef } from "react";
import { useGame } from "../state/useGame.js";
import { useSocket } from "../socket/SocketContext.jsx";
import { S2C } from "../lib/events.js";
import { CanvasRenderer, StrokeBatcher } from "../lib/canvas/index.js";

/**
 * Canvas Component
 * Leverages OOP CanvasRenderer & StrokeBatcher for resolution-independent drawing,
 * batching, and zero-react-render high-frequency stroke streaming.
 */
export default function Canvas({ brush }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const { actions, amDrawer, state } = useGame();
  const socket = useSocket();

  // Keep latest brush / drawer-status in refs so pointer handlers always read current values
  const brushRef = useRef(brush);
  useEffect(() => {
    brushRef.current = brush;
  }, [brush]);

  const amDrawerRef = useRef(amDrawer);
  useEffect(() => {
    amDrawerRef.current = amDrawer;
  }, [amDrawer]);

  // One-time CanvasRenderer engine instantiation
  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
    }
  }, []);

  // Paint incoming strokes relayed by the server
  useEffect(() => {
    if (!socket) return undefined;

    const onDraw = (msg) => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      if (msg.type === "start") {
        renderer.renderStart(msg.x, msg.y, msg.color || "#111827", msg.size || 8);
      } else if (msg.type === "move") {
        renderer.renderMoveBatch(msg.points || []);
      }
    };

    const onClear = () => {
      rendererRef.current?.clear();
    };

    socket.on(S2C.DRAW_UPDATE, onDraw);
    socket.on(S2C.CLEAR, onClear);

    return () => {
      socket.off(S2C.DRAW_UPDATE, onDraw);
      socket.off(S2C.CLEAR, onClear);
    };
  }, [socket]);

  // Wipe locally whenever a new round starts
  useEffect(() => {
    rendererRef.current?.clear();
  }, [state.round.endsAt]);

  // Drawer pointer input pipeline: draws locally + streams batched packets via StrokeBatcher
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let drawing = false;
    const batcher = new StrokeBatcher((points) => {
      actions.drawMove(points);
    });

    const down = (e) => {
      if (!amDrawerRef.current) return;
      drawing = true;

      const p = CanvasRenderer.toNormalized(e.clientX, e.clientY, canvas.getBoundingClientRect());
      const renderer = rendererRef.current;
      if (renderer) {
        renderer.renderStart(p.x, p.y, brushRef.current.color, brushRef.current.size);
      }

      actions.drawStart({
        x: p.x,
        y: p.y,
        color: brushRef.current.color,
        size: brushRef.current.size,
      });

      canvas.setPointerCapture?.(e.pointerId);
    };

    const move = (e) => {
      if (!drawing || !amDrawerRef.current) return;

      const p = CanvasRenderer.toNormalized(e.clientX, e.clientY, canvas.getBoundingClientRect());
      const renderer = rendererRef.current;
      if (renderer) {
        renderer.renderMoveBatch([p], brushRef.current.color, brushRef.current.size);
      }

      batcher.push(p);
    };

    const up = () => {
      if (!drawing) return;
      drawing = false;
      batcher.flush();
      actions.drawEnd();
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      batcher.cancel();
    };
  }, [actions]);

  const interactive = amDrawer && state.state === "playing";

  return (
    <canvas
      ref={canvasRef}
      className="board"
      style={{ cursor: interactive ? "crosshair" : "default", touchAction: "none" }}
    />
  );
}
