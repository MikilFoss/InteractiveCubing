"use client";

import { useEffect, useRef } from "react";
import type { TwistyPlayer as TwistyPlayerType } from "cubing/twisty";

interface TwistyPlayerProps {
  alg: string;
  setup?: string;
  visualization?: "3D" | "2D";
  controlPanel?: "bottom-row" | "none";
  background?: "none" | "checkered";
  hintFacelets?: "none" | "floating";
  experimentalStickering?: string;
  className?: string;
}

export default function TwistyPlayer({
  alg,
  setup,
  visualization = "3D",
  controlPanel = "bottom-row",
  background = "none",
  hintFacelets = "floating",
  experimentalStickering = "F2L",
  className,
}: TwistyPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TwistyPlayerType | null>(null);

  useEffect(() => {
    const initPlayer = async () => {
      if (!containerRef.current) return;

      // Dynamic import to avoid SSR issues
      const { TwistyPlayer } = await import("cubing/twisty");

      // Clean up existing player
      if (playerRef.current) {
        playerRef.current.remove();
      }

      const player = new TwistyPlayer({
        puzzle: "3x3x3",
        alg: alg,
        experimentalSetupAlg: setup,
        visualization: visualization,
        controlPanel: controlPanel,
        background: background,
        hintFacelets: hintFacelets,
        experimentalStickering: experimentalStickering,
      });

      // Style the player
      player.style.width = "100%";
      player.style.height = "200px";

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(player);
      playerRef.current = player;
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
    };
  }, [alg, setup, visualization, controlPanel, background, hintFacelets, experimentalStickering]);

  return <div ref={containerRef} className={className} />;
}
