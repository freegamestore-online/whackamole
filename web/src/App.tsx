import { useState, useCallback, useEffect, useRef } from "react";
import { GameShell, GameTopbar, GameAuth } from "@freegamestore/games";
import { Game } from "./components/Game";

const BEST_SCORE_KEY = "freewhackamole-best";

function getBestScore(): number {
  const v = localStorage.getItem(BEST_SCORE_KEY);
  return v ? parseInt(v, 10) : 0;
}

export default function App() {
  const [phase, setPhase] = useState<"menu" | "playing" | "over">("playing");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(getBestScore);
  const [paused, setPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const scoreRef = useRef(0);

  const handleScore = useCallback((s: number) => {
    scoreRef.current = s;
    setScore(s);
  }, []);

  const handleGameOver = useCallback(() => {
    const final = scoreRef.current;
    const best = getBestScore();
    if (final > best) {
      localStorage.setItem(BEST_SCORE_KEY, String(final));
      setBestScore(final);
    }
    setPhase("over");
  }, []);

  const start = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    setGameKey((k) => k + 1);
    setPhase("playing");
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== "playing" && (e.key === " " || e.key === "Enter")) {
        start();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, start]);

  return (
    <GameShell
      topbar={
        <GameTopbar
          title="Whack-a-Mole"
          stats={[
            { label: "Score", value: score, accent: true },
            { label: "Best", value: bestScore },
          ]}
          onPlayPause={phase === "playing" ? () => setPaused(p => !p) : undefined}
          paused={paused}
          onRestart={start}
          actions={<GameAuth />}
          rules={
            <div>
              <h3 style={{ fontWeight: 700 }}>Whack-a-Mole</h3>
              <h4 style={{ fontWeight: 600 }}>Rules</h4>
              <ul><li>Tap moles when they pop up — 30-second rounds</li></ul>
              <h4 style={{ fontWeight: 600 }}>Scoring</h4>
              <ul><li>Green mole: +1 point</li><li>Red mole: -1 point (avoid!)</li><li>Golden mole: +3 bonus</li></ul>
            </div>
          }
        />
      }
    >
      <div className="relative w-full h-full">
        <Game key={gameKey} onScore={handleScore} onGameOver={handleGameOver} paused={paused} />
        {phase === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: "rgba(0,0,0,0.55)" }}>
            <p
              className="text-xl font-bold"
              style={{ color: "var(--error)", fontFamily: "Fraunces, serif" }}
            >
              Game Over! Score: {score}
            </p>
            <button
              onClick={start}
              className="px-6 py-3 rounded-xl font-semibold min-h-[2.75rem]"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
