import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { Game } from "./Game";

beforeEach(() => {
  vi.useFakeTimers();
  // 0.99 => last free hole and a "normal" mole (above the golden + red chances).
  vi.spyOn(Math, "random").mockReturnValue(0.99);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const moles = () => screen.queryAllByRole("button", { name: /mole/ });

function setup(paused = false) {
  const props = { onScore: vi.fn(), onGameOver: vi.fn(), onStats: vi.fn() };
  const view = render(<Game {...props} paused={paused} />);
  const setPaused = (p: boolean) => view.rerender(<Game {...props} paused={p} />);
  return { ...props, setPaused };
}

describe("Whack-a-Mole pause", () => {
  it("does not consume round time while paused", () => {
    const { onGameOver, onStats, setPaused } = setup();
    tick(5000);
    setPaused(true);
    tick(60_000);
    expect(onGameOver).not.toHaveBeenCalled();
    setPaused(false);
    tick(1000);
    expect(onStats).toHaveBeenLastCalledWith({ timeLeft: 24 });
    // Board keeps spawning after a long pause.
    tick(1000);
    expect(moles().length).toBeGreaterThan(0);
    tick(24_000);
    expect(onGameOver).toHaveBeenCalledOnce();
  });

  it("hides moles while paused and keeps them alive until resumed", () => {
    const { setPaused } = setup();
    tick(600);
    expect(moles()).toHaveLength(1);
    setPaused(true);
    expect(moles()).toHaveLength(0);
    tick(10_000);
    setPaused(false);
    expect(moles()).toHaveLength(1);
  });

  it("ignores hits while paused", () => {
    const { onScore, setPaused } = setup();
    tick(600);
    const mole = moles()[0]!;
    setPaused(true);
    fireEvent.pointerDown(mole);
    expect(onScore).not.toHaveBeenCalled();
  });
});

describe("Whack-a-Mole scoring", () => {
  it("awards +10 for a normal mole, matching the rules", () => {
    const { onScore } = setup();
    tick(600);
    fireEvent.pointerDown(moles()[0]!);
    expect(onScore).toHaveBeenCalledWith(10);
  });
});
