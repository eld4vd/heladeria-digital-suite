import { useCallback, useEffect, useState, useRef } from "react";

const FloatingClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const clockRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Actualizar la hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Inicializar posición en la esquina inferior derecha
  useEffect(() => {
    const updatePosition = () => {
      if (clockRef.current) {
        const rect = clockRef.current.getBoundingClientRect();
        const initialX = window.innerWidth - rect.width - 24; // 24px from right edge
        const initialY = window.innerHeight - rect.height - 450; // 450px from bottom (más arriba)
        setPosition({ x: initialX, y: initialY });
        setInitialPosition({ x: initialX, y: initialY });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  // Reset position after 5 seconds of inactivity
  useEffect(() => {
    if (!isDragging) {
      resetTimerRef.current = setTimeout(() => {
        setPosition(initialPosition);
      }, 5000);
    }
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [isDragging, initialPosition]);

  // Manejar inicio de arrastre (mouse o touch)
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  }, [position.x, position.y]);

  // Manejar movimiento durante el arrastre con throttling
  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const newX = clientX - dragStart.x;
      const newY = clientY - dragStart.y;

      const maxX = window.innerWidth - (clockRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (clockRef.current?.offsetHeight || 0);

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      // Usar requestAnimationFrame para suavizar el movimiento y evitar exceso de renders
      requestAnimationFrame(() => {
        setPosition({ x: boundedX, y: boundedY });
      });
    },
    [dragStart.x, dragStart.y, isDragging]
  );

  // Manejar fin de arrastre
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Agregar oyentes de eventos globales para el arrastre
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleDragMove);
      document.addEventListener("touchend", handleDragEnd);
    }
    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleDragEnd, handleDragMove]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      ref={clockRef}
      className={`fixed z-50 transition-transform duration-5 ease-out ${
        isDragging
          ? "cursor-grabbing scale-105 shadow-2xl"
          : "cursor-grab hover:scale-102 hover:shadow-xl"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? "rotate(2deg)" : "rotate(0deg)",
      }}
  onMouseDown={handleDragStart}
  onTouchStart={handleDragStart}
      onDoubleClick={() => setPosition(initialPosition)}
    >
      <div
        className={`bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl p-2 ${
          isDragging
            ? "bg-white/95 border-blue-300/70 shadow-blue-200/50"
            : "hover:bg-white/95"
        }`}
      >
        <div className="text-center select-none">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentTime.toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
          <div className="flex justify-center mt-2 opacity-30 hover:opacity-60 transition-opacity">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="currentColor"
              className="text-gray-400"
            >
              <circle cx="2" cy="2" r="1" />
              <circle cx="6" cy="2" r="1" />
              <circle cx="10" cy="2" r="1" />
              <circle cx="2" cy="6" r="1" />
              <circle cx="6" cy="6" r="1" />
              <circle cx="10" cy="6" r="1" />
            </svg>
          </div>
        </div>
      </div>
      {!isDragging && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Arrastra para mover • Doble click para resetear
        </div>
      )}
    </div>
  );
};

export default FloatingClock;
