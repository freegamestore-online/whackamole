export type GamePhase = "menu" | "playing" | "over";

export type MoleType = "normal" | "red" | "golden";

export interface Mole {
  id: number;
  hole: number;
  type: MoleType;
  /** Game-clock ms (pause excluded) at which the mole leaves the board. */
  expiresAt: number;
  whacked: boolean;
}
