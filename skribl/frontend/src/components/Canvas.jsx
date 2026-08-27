import { useEffect, useRef } from "react";
import { useGame } from "../state/useGame.js";
import { useSocket } from "../socket/SocketContext.jsx";
import { S2C } from "../lib/events.js";
import { LOGICAL_W, LOGICAL_H, toNorm, fromNorm } from "../lib/canvas.js";

// Draws imperatively straight to the 2D context. Incoming draw events and the
// drawer's own pointer input NEVER go through React state, so high-frequency draw
// traffic causes zero re-renders.
export default function Canvas({ brush }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const { actions, amDrawer, state } = useGame();
  const socket = useSocket();

  // Keep latest brush / drawer-status in refs so the once-bound pointer handlers
  // always read current values.
  const brushRef = useRef(brush);
  useEffect(() => {
    brushRef.current = brush;
  }, [brush]);
  const amDrawerRef = useRef(amDrawer);
  useEffect(() => {
    amDrawerRef.current = amDrawer;
  }, [amDrawer]);

  // One-time context setup.
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = LOGICAL_W;
    canvas.height = LOGICAL_H;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    clearCanvas(ctx);
  }, []);

  // Paint incoming strokes (all clients; the server never echoes to the drawer).
  useEffect(() => {
    if (!socket) return undefined;
    let cursor = { x: 0, y: 0 };

    const onDraw = (msg) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (msg.type === "start") {
        cursor = fromNorm(msg.x, msg.y);
        ctx.strokeStyle = msg.color || "#111827";
        ctx.lineWidth = msg.size || 8;
        dot(ctx, cursor);
      } else if (msg.type === "move") {
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        for (const p of msg.points || []) {
          const q = fromNorm(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          cursor = q;
        }
        ctx.stroke();
      }
    };
    const onClear = () => clearCanvas(ctxRef.current);

    socket.on(S2C.DRAW_UPDATE, onDraw);
    socket.on(S2C.CLEAR, onClear);
    return () => {
      socket.off(S2C.DRAW_UPDATE, onDraw);
      socket.off(S2C.CLEAR, onClear);
    };
  }, [socket]);

  // Wipe locally whenever a new round starts (endsAt changes) — covers the drawer,
  // who won't receive their own clear-canvas relay.
  useEffect(() => {
    clearCanvas(ctxRef.current);
  }, [state.round.endsAt]);

  // Drawer pointer input: draw locally + stream to the server (rAF-batched).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let drawing = false;
    let last = null;
    let buffer = [];
    let raf = 0;

    const flush = () => {
      raf = 0;
      if (buffer.length) {
        actions.drawMove(buffer);
        buffer = [];
      }
    };

    const down = (e) => {
      if (!amDrawerRef.current) return;
      drawing = true;
      const p = toNorm(e.clientX, e.clientY, canvas.getBoundingClientRect());
      last = p;
      const ctx = ctxRef.current;
      ctx.strokeStyle = brushRef.current.color;
      ctx.lineWidth = brushRef.current.size;
      dot(ctx, fromNorm(p.x, p.y));
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
      const p = toNorm(e.clientX, e.clientY, canvas.getBoundingClientRect());
      const ctx = ctxRef.current;
      const a = fromNorm(last.x, last.y);
      const b = fromNorm(p.x, p.y);
      ctx.strokeStyle = brushRef.current.color;
      ctx.lineWidth = brushRef.current.size;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      last = p;
      buffer.push({ x: p.x, y: p.y });
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const up = () => {
      if (!drawing) return;
      drawing = false;
      if (raf) {
        cancelAnimationFrame(raf);
        flush();
      }
      actions.drawEnd();
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (raf) cancelAnimationFrame(raf);
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

function clearCanvas(ctx) {
  if (!ctx) return;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  ctx.restore();
}

// A tiny segment so a single click/tap leaves a visible dot.
function dot(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + 0.1, p.y + 0.1);
  ctx.stroke();
}
