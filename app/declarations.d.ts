/**
 * Module declarations for assets and test globals.
 *
 * The reference to "jest" lives here, not in the tsconfig `types` field, on
 * purpose: filling in `types` disables the automatic inclusion of every other
 * `@types/*` package — that is exactly how this project's typing broke before.
 * A `/// <reference>` inside an already-included file adds without excluding.
 */

/// <reference types="jest" />

declare module "*.svg" {
  import type React from "react";
  import type { SvgProps } from "react-native-svg";

  const content: React.FC<SvgProps>;
  export default content;
}

// NativeWind consumes the CSS through Metro; to TypeScript it is just a
// side-effect import with no type.
declare module "*.css" {
  const content: string;
  export default content;
}
