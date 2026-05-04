import { useRef, useEffect, useCallback, useState } from "react";
import type { Mole, MoleType } from "../types";

const GAME_DURATION = 30;
const GRID_SIZE = 3;
const HOLES = GRID_SIZE * GRID_SIZE;

const MOLE_BASE_DURATION = 1200;
const MOLE_MIN_DURATION = 800;
const GOLDEN_DURATION_MULT = 0.6;

interface GameProps {
  onScore: (score: number) => void;
  onGameOver: () => void;
}

function getMoleType(elapsed: number): MoleType {
  const r = Math.random();
  const goldenChance = 0.08;
  const redChance = 0.15 + elapsed * 0.003;
  if (r < goldenChance) return "golden";
  if (r < goldenChance + redChance) return "red";
  return "normal";
}

function getMoleDuration(elapsed: number, type: MoleType): number {
  const base = MOLE_BASE_DURATION - elapsed * 10;
  const clamped = Math.max(MOLE_MIN_DURATION, base);
  return type === "golden" ? clamped * GOLDEN_DURATION_MULT : clamped;
}

function getMaxMoles(elapsed: number): number {
  if (elapsed < 5) return 1;
  if (elapsed < 12) return 2;
  if (elapsed < 20) return 3;
  return 4;
}

/* ---------- Particle Effects ---------- */

interface Particle {
  id: number;
  x: number;
  y: number;
  type: "star" | "dust";
}

function StarParticles({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: x - 30, top: y - 30, width: 60, height: 60 }}
    >
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * 360;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 30,
              top: 30,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#fbbf24",
              animation: `star-fly-${i % 3} 0.6s ease-out forwards`,
              transform: `rotate(${angle}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

function DustPuff({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x - 20,
        top: y - 20,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(139, 119, 101, 0.4)",
        animation: "dust-puff 0.4s ease-out forwards",
      }}
    />
  );
}

/* ---------- Mole Component ---------- */

interface MoleViewProps {
  mole: Mole;
  holeRect: DOMRect | null;
  onWhack: (mole: Mole, clientX: number, clientY: number) => void;
}

function MoleView({ mole, holeRect, onWhack }: MoleViewProps) {
  const bodyColor =
    mole.type === "red" ? "#dc2626" : mole.type === "golden" ? "#f59e0b" : "#92400e";
  const bodyDark =
    mole.type === "red" ? "#991b1b" : mole.type === "golden" ? "#d97706" : "#78350f";

  const handleClick = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!mole.whacked) {
      onWhack(mole, e.clientX, e.clientY);
    }
  };

  const animName = mole.whacked ? "mole-bonk" : "mole-popup";
  const animDuration = mole.whacked ? "0.3s" : "0.15s";

  return (
    <div
      onPointerDown={handleClick}
      style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: holeRect ? holeRect.width * 0.65 : 52,
        height: holeRect ? holeRect.height * 0.8 : 64,
        cursor: 'url("data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2732%27 height=%2732%27 viewBox=%270 0 32 32%27><text y=%2724%27 font-size=%2724%27>🔨</text></svg>") 16 16, crosshair',
        animation: `${animName} ${animDuration} ease-out forwards`,
        zIndex: 2,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* Mole body */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          width: "80%",
          height: "75%",
          background: bodyColor,
          borderRadius: "45% 45% 10% 10%",
        }}
      />
      {/* Mole belly */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "25%",
          width: "50%",
          height: "35%",
          background: bodyDark,
          borderRadius: "40% 40% 8% 8%",
        }}
      />
      {/* Eyes */}
      <div
        style={{
          position: "absolute",
          bottom: "55%",
          left: "25%",
          width: "14%",
          height: "14%",
          background: "#fff",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "20%",
            width: "50%",
            height: "50%",
            background: "#1a1a1a",
            borderRadius: "50%",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "55%",
          right: "25%",
          width: "14%",
          height: "14%",
          background: "#fff",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "20%",
            width: "50%",
            height: "50%",
            background: "#1a1a1a",
            borderRadius: "50%",
          }}
        />
      </div>
      {/* Nose */}
      <div
        style={{
          position: "absolute",
          bottom: "42%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "16%",
          height: "10%",
          background: "#ec4899",
          borderRadius: "50%",
        }}
      />
      {/* Golden shimmer */}
      {mole.type === "golden" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "45% 45% 10% 10%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)",
            animation: "golden-shimmer 0.8s ease-in-out infinite alternate",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

/* ---------- Main Game ---------- */

export function Game({ onScore, onGameOver }: GameProps) {
  const [moles, setMoles] = useState<Mole[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [particles, setParticles] = useState<Particle[]>([]);
  const scoreRef = useRef(0);
  const moleIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const gameStartRef = useRef(Date.now());
  const holeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const molesRef = useRef<Mole[]>([]);
  const gameOverCalledRef = useRef(false);
  const onScoreRef = useRef(onScore);
  const onGameOverRef = useRef(onGameOver);
  onScoreRef.current = onScore;
  onGameOverRef.current = onGameOver;

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!gameOverCalledRef.current) {
            gameOverCalledRef.current = true;
            onGameOverRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mole spawner
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function spawnMole() {
      const elapsed = (Date.now() - gameStartRef.current) / 1000;
      if (elapsed >= GAME_DURATION) return;

      const currentMoles = molesRef.current.filter((m) => !m.whacked);
      const maxMoles = getMaxMoles(elapsed);
      if (currentMoles.length < maxMoles) {
        const occupiedHoles = new Set(currentMoles.map((m) => m.hole));
        const freeHoles = Array.from({ length: HOLES }, (_, i) => i).filter(
          (h) => !occupiedHoles.has(h),
        );
        if (freeHoles.length > 0) {
          const hole = freeHoles[Math.floor(Math.random() * freeHoles.length)]!;
          const type = getMoleType(elapsed);
          const duration = getMoleDuration(elapsed, type);
          const newMole: Mole = {
            id: moleIdRef.current++,
            hole,
            type,
            appearedAt: Date.now(),
            duration,
            whacked: false,
          };
          molesRef.current = [...molesRef.current, newMole];
          setMoles([...molesRef.current]);

          // Auto-remove after duration
          setTimeout(() => {
            molesRef.current = molesRef.current.filter((m) => m.id !== newMole.id);
            setMoles([...molesRef.current]);
          }, duration);
        }
      }

      const nextSpawnDelay = 400 + Math.random() * 600;
      timeout = setTimeout(spawnMole, nextSpawnDelay);
    }

    timeout = setTimeout(spawnMole, 500);
    return () => clearTimeout(timeout);
  }, []);

  const addParticle = useCallback((x: number, y: number, type: "star" | "dust") => {
    const id = particleIdRef.current++;
    setParticles((prev) => [...prev, { id, x, y, type }]);
  }, []);

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleWhack = useCallback(
    (mole: Mole, clientX: number, clientY: number) => {
      // Mark as whacked in ref
      molesRef.current = molesRef.current.map((m) =>
        m.id === mole.id ? { ...m, whacked: true } : m,
      );
      setMoles([...molesRef.current]);

      // Update score
      let delta: number;
      if (mole.type === "red") {
        delta = -20;
      } else if (mole.type === "golden") {
        delta = 50;
      } else {
        delta = 10;
      }
      scoreRef.current = Math.max(0, scoreRef.current + delta);
      onScoreRef.current(scoreRef.current);

      // Particle
      addParticle(clientX, clientY, "star");

      // Remove after bonk animation
      setTimeout(() => {
        molesRef.current = molesRef.current.filter((m) => m.id !== mole.id);
        setMoles([...molesRef.current]);
      }, 300);
    },
    [addParticle],
  );

  const handleHoleMiss = useCallback(
    (e: React.PointerEvent, holeIndex: number) => {
      // Only trigger dust if no mole is in this hole
      const hasMole = molesRef.current.some((m) => m.hole === holeIndex && !m.whacked);
      if (!hasMole) {
        addParticle(e.clientX, e.clientY, "dust");
      }
    },
    [addParticle],
  );

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-4 select-none"
      style={{
        cursor:
          'url("data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2732%27 height=%2732%27 viewBox=%270 0 32 32%27><text y=%2724%27 font-size=%2724%27>🔨</text></svg>") 16 16, crosshair',
      }}
    >
      {/* HUD */}
      <div className="flex items-center gap-6">
        <div
          className="text-2xl font-bold px-4 py-1 rounded-xl"
          style={{
            fontFamily: "Fraunces, serif",
            background: timeLeft <= 5 ? "var(--error)" : "var(--accent)",
            color: "#fff",
          }}
        >
          {timeLeft}s
        </div>
        <div
          className="text-2xl font-bold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          {scoreRef.current} pts
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: "1rem",
          maxWidth: 380,
          width: "100%",
          padding: "0 1rem",
        }}
      >
        {Array.from({ length: HOLES }).map((_, i) => {
          const mole = moles.find((m) => m.hole === i);
          return (
            <div
              key={i}
              ref={(el) => {
                holeRefs.current[i] = el;
              }}
              onPointerDown={(e) => handleHoleMiss(e, i)}
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
                touchAction: "none",
              }}
            >
              {/* Hole bg */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse at center, #3e2723 0%, #5d4037 60%, #795548 100%)",
                  boxShadow: "inset 0 4px 12px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                }}
              >
                {/* Grass rim */}
                <div
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    border: "4px solid #4caf50",
                    pointerEvents: "none",
                  }}
                />
                {mole && (
                  <MoleView
                    mole={mole}
                    holeRect={holeRefs.current[i]?.getBoundingClientRect() ?? null}
                    onWhack={handleWhack}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Particles overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
        {particles.map((p) =>
          p.type === "star" ? (
            <StarParticles
              key={p.id}
              x={p.x}
              y={p.y}
              onDone={() => removeParticle(p.id)}
            />
          ) : (
            <DustPuff
              key={p.id}
              x={p.x}
              y={p.y}
              onDone={() => removeParticle(p.id)}
            />
          ),
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes mole-popup {
          0% { transform: translateX(-50%) translateY(100%); }
          100% { transform: translateX(-50%) translateY(0); }
        }
        @keyframes mole-bonk {
          0% { transform: translateX(-50%) translateY(0) scaleY(1); }
          50% { transform: translateX(-50%) translateY(20%) scaleY(0.5) scaleX(1.3); }
          100% { transform: translateX(-50%) translateY(100%) scaleY(0.3) scaleX(1.1); opacity: 0; }
        }
        @keyframes star-fly-0 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(25px, -30px) scale(0); opacity: 0; }
        }
        @keyframes star-fly-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-20px, -35px) scale(0); opacity: 0; }
        }
        @keyframes star-fly-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(15px, 25px) scale(0); opacity: 0; }
        }
        @keyframes dust-puff {
          0% { transform: scale(0.3); opacity: 0.7; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes golden-shimmer {
          0% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
