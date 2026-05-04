export type GamePhase = "menu" | "playing" | "over";

export type MoleType = "normal" | "red" | "golden";

export interface Mole {
  id: number;
  hole: number;
  type: MoleType;
  appearedAt: number;
  duration: number;
  whacked: boolean;
}
