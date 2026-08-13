import { useCallback, useRef } from "react";

/**
 * iOS Safari pode "engolir" o primeiro toque quando o botão está dentro de um
 * ancestral que ainda tem uma animação/transform de entrada rodando.
 * Este hook dispara a ação no pointerup (toque) e desduplica com o click.
 */
export function useTap(handler: () => void) {
  const last = useRef(0);

  const fire = useCallback(() => {
    const now = Date.now();
    if (now - last.current < 600) return;
    last.current = now;
    handler();
  }, [handler]);

  return {
    onPointerUp: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") return;
      fire();
    },
    onClick: () => fire(),
  };
}
