declare module "game/visual" {
  import { RoomPosition } from "game/prototypes";

  export function line(
    pos1: RoomPosition,
    pos2: RoomPosition,
    style?: LineStyle
  ): void;
  export function circle(pos: RoomPosition, style?: CircleStyle): void;
  export function rect(
    topLeftPos: RoomPosition,
    width: number,
    height: number,
    style?: PolyStyle
  ): void;
  export function poly(points: RoomPosition[], style?: PolyStyle): void;
  export function text(msg: string, pos: RoomPosition, style?: TextStyle): void;
}

interface LineStyle {
  /**
   * Line width, default is 0.1.
   */
  width?: number;
  /**
   * Line color in any web format, default is #ffffff(white).
   */
  color?: string;
  /**
   * Opacity value, default is 0.5.
   */
  opacity?: number;
  /**
   * Either undefined (solid line), dashed, or dotted.Default is undefined.
   */
  lineStyle?: "dashed" | "dotted" | undefined;
}

interface PolyStyle {
  /**
   * Fill color in any web format, default is undefined (no fill).
   */
  fill?: string | undefined;
  /**
   * Opacity value, default is 0.5.
   */
  opacity?: number;
  /**
   * Stroke color in any web format, default is #ffffff (white).
   */
  stroke?: string;
  /**
   * Stroke line width, default is 0.1.
   */
  strokeWidth?: number;
  /**
   * Either undefined (solid line), dashed, or dotted. Default is undefined.
   */
  lineStyle?: "dashed" | "dotted" | "solid" | undefined;
}

interface CircleStyle extends PolyStyle {
  /**
   * Circle radius, default is 0.15.
   */
  radius?: number;
}

interface TextStyle {
  /**
   * Font color in any web format, default is #ffffff(white).
   */
  color?: string;
  /**
   * Either a number or a string in one of the following forms:
   * 0.7 - relative size in game coordinates
   * 20px - absolute size in pixels
   * 0.7 serif
   * bold italic 1.5 Times New Roman
   */
  font?: number | string;
  /**
   * Stroke color in any web format, default is undefined (no stroke).
   */
  stroke?: string | undefined;
  /**
   * Stroke width, default is 0.15.
   */
  strokeWidth?: number;
  /**
   * Background color in any web format, default is undefined (no background).When background is enabled, text vertical align is set to middle (default is baseline).
   */
  backgroundColor?: string | undefined;

  /**
   * Background rectangle padding, default is 0.3.
   */
  backgroundPadding?: number;
  align?: "center" | "left" | "right";
  /**
   * Opacity value, default is 1.0.
   */
  opacity?: number;
}
