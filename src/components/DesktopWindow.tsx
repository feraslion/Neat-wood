import React, { useRef, useState, useEffect } from "react";
import { Minimize2, Maximize2, X, Bot, Notebook, CheckSquare, Calculator, Sparkles, Move } from "lucide-react";
import { WindowInstance } from "../types";
import { motion } from "motion/react";

interface DesktopWindowProps {
  key?: React.Key;
  window: WindowInstance;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
}

export default function DesktopWindow({
  window,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  children,
}: DesktopWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const windowStartSize = useRef({ width: 0, height: 0 });

  // Handle Dragging
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return; // Can't drag maximized windows
    onFocus(window.id);

    // Only drag with left click
    if (e.button !== 0) return;

    // Prevent dragging on button clicks
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartPos.current = { x: window.x, y: window.y };

    e.preventDefault();
  };

  // Handle Resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    onFocus(window.id);

    if (e.button !== 0) return;

    setIsResizing(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartSize.current = { width: window.width, height: window.height };

    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        
        // Boundaries (prevent window from getting dragged off screen entirely)
        const newX = Math.max(-window.width + 100, Math.min(windowStartPos.current.x + dx, (globalThis.innerWidth || 1024) - 100));
        const newY = Math.max(0, Math.min(windowStartPos.current.y + dy, (globalThis.innerHeight || 768) - 100));
        
        onMove(window.id, newX, newY);
      }

      if (isResizing) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;

        const newWidth = Math.max(300, windowStartSize.current.width + dx);
        const newHeight = Math.max(250, windowStartSize.current.height + dy);

        onResize(window.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, window]);

  // Map icon string to component
  const renderIcon = () => {
    const props = { size: 14, className: "text-slate-300" };
    switch (window.icon) {
      case "Bot":
        return <Bot {...props} className="text-teal-400" />;
      case "Notebook":
        return <Notebook {...props} className="text-amber-400" />;
      case "CheckSquare":
        return <CheckSquare {...props} className="text-indigo-400" />;
      case "Calculator":
        return <Calculator {...props} className="text-emerald-400" />;
      default:
        return <Sparkles {...props} className="text-blue-400" />;
    }
  };

  if (window.isMinimized) return null;

  return (
    <motion.div
      ref={windowRef}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={() => onFocus(window.id)}
      style={{
        zIndex: window.zIndex,
        width: window.isMaximized ? "100%" : `${window.width}px`,
        height: window.isMaximized ? "calc(100% - 64px)" : `${window.height}px`, // 64px accounts for taskbar height
        left: window.isMaximized ? "0" : `${window.x}px`,
        top: window.isMaximized ? "0" : `${window.y}px`,
      }}
      className={`absolute flex flex-col rounded-2xl border bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md overflow-hidden ${
        window.isMaximized ? "rounded-none border-none" : "border-slate-800/80"
      }`}
    >
      {/* Window Header */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className={`flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800/80 select-none ${
          window.isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
        dir="rtl"
      >
        {/* Title and Icon */}
        <div className="flex items-center gap-2">
          {renderIcon()}
          <span className="text-xs font-semibold text-slate-200">{window.title}</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1.5 flex-row-reverse">
          <button
            onClick={() => onClose(window.id)}
            title="إغلاق"
            className="p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
          >
            <X size={13} />
          </button>
          <button
            onClick={() => onMaximize(window.id)}
            title={window.isMaximized ? "استعادة الحجم" : "تكبير"}
            className="p-1 rounded-md hover:bg-slate-850 text-slate-400 hover:text-slate-100 transition"
          >
            <Maximize2 size={11} />
          </button>
          <button
            onClick={() => onMinimize(window.id)}
            title="تصغير"
            className="p-1 rounded-md hover:bg-slate-850 text-slate-400 hover:text-slate-100 transition"
          >
            <Minimize2 size={12} />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Resize handle (only visible if not maximized) */}
      {!window.isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5"
          title="سحب لتغيير الحجم"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" className="text-slate-600 fill-current">
            <line x1="6" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" />
            <line x1="6" y1="3" x2="3" y2="6" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
