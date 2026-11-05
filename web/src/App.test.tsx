import { describe, it, expect } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import App from "./App";

describe("App restart", () => {
  // Generous timeout: the first full App render (SDK shell) is slow on a loaded CI box.
  it("clears pause when restarting", { timeout: 20_000 }, () => {
    render(<App />);
    const pause = screen.getByRole("button", { name: "Pause" });
    fireEvent.click(pause);
    expect(pause).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Pause" })).toHaveAttribute("aria-pressed", "false");
  });
});
