import { describe, it, expect } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import App from "./App";

describe("App restart", () => {
  it("clears pause when restarting", () => {
    render(<App />);
    const pause = screen.getByRole("button", { name: "Pause" });
    fireEvent.click(pause);
    expect(pause).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Pause" })).toHaveAttribute("aria-pressed", "false");
  });
});
