import { shade } from "@/lib/iso";
import type { ExteriorKind } from "@/lib/types";

interface ExteriorFacadeProps {
  kind: ExteriorKind;
  bodyColor: string;
  trimColor: string;
}

/**
 * Flat facade artwork authored in an ordinary unit square (fx 0..1 across,
 * fy 0..1 down, 0 at the roofline). The caller wraps this in a face matrix
 * transform — nothing here reasons about isometric space.
 */
export function ExteriorFacade({ kind, bodyColor, trimColor }: ExteriorFacadeProps) {
  const glass = shade(bodyColor, 0.5);
  const frame = shade(trimColor, -0.1);

  switch (kind) {
    case "gallery-front":
      return (
        <g>
          <rect x={0.12} y={0.16} width={0.56} height={0.46} fill={frame} />
          <rect x={0.16} y={0.2} width={0.48} height={0.38} fill={glass} />
          <rect x={0.72} y={0.14} width={0.16} height={0.62} fill={frame} />
          <rect x={0.745} y={0.18} width={0.11} height={0.54} fill={shade(bodyColor, -0.3)} />
          <circle cx={0.8} cy={0.46} r={0.012} fill={trimColor} />
          <rect x={0.14} y={0.66} width={0.5} height={0.07} fill={trimColor} />
        </g>
      );
    case "studio-front":
      return (
        <g>
          <rect x={0} y={0} width={1} height={0.1} fill={frame} />
          <rect x={0.06} y={0.16} width={0.42} height={0.5} fill={frame} />
          <rect x={0.1} y={0.2} width={0.34} height={0.42} fill={glass} />
          <rect x={0.58} y={0.14} width={0.18} height={0.62} fill={frame} />
          <rect x={0.605} y={0.18} width={0.13} height={0.54} fill={shade(bodyColor, -0.3)} />
          <circle cx={0.67} cy={0.46} r={0.012} fill={trimColor} />
        </g>
      );
    case "shop-front":
      return (
        <g>
          <path d="M -0.02 0.08 L 0.5 -0.04 L 1.02 0.08 L 1.02 0.16 L -0.02 0.16 Z" fill={frame} />
          <rect x={0.08} y={0.22} width={0.28} height={0.44} fill={frame} />
          <rect x={0.115} y={0.26} width={0.21} height={0.36} fill={glass} />
          <rect x={0.64} y={0.22} width={0.28} height={0.44} fill={frame} />
          <rect x={0.675} y={0.26} width={0.21} height={0.36} fill={glass} />
          <rect x={0.42} y={0.16} width={0.16} height={0.6} fill={frame} />
          <rect x={0.445} y={0.2} width={0.11} height={0.52} fill={shade(bodyColor, -0.3)} />
          <circle cx={0.49} cy={0.46} r={0.012} fill={trimColor} />
        </g>
      );
    case "cafe-front":
      return (
        <g>
          <path d="M -0.02 0.1 L 0.14 -0.04 L 0.3 0.1 L 0.46 -0.04 L 0.62 0.1 L 0.78 -0.04 L 0.94 0.1 L 1.02 0.1 L 1.02 0.18 L -0.02 0.18 Z" fill={frame} />
          <rect x={0.1} y={0.24} width={0.26} height={0.42} fill={frame} />
          <rect x={0.135} y={0.28} width={0.19} height={0.34} fill={glass} />
          <rect x={0.56} y={0.18} width={0.18} height={0.58} fill={frame} />
          <rect x={0.605} y={0.22} width={0.13} height={0.5} fill={shade(bodyColor, -0.3)} />
          <circle cx={0.67} cy={0.46} r={0.012} fill={trimColor} />
          <circle cx={0.82} cy={0.4} r={0.09} fill={frame} />
          <circle cx={0.82} cy={0.4} r={0.065} fill={glass} />
        </g>
      );
    default:
      return null;
  }
}
