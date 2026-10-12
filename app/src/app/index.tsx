import { ZoomSpikeScreen } from "@/features/zoom-spike";

// The route imports the screen through the feature's public API (R3) and
// renders it. Nothing else belongs here.
//
// ⚠️ SPIKE — points at src/features/zoom-spike instead of the reference
// src/features/example while the Zoom SDK validation is in progress.
export default function Index() {
  return <ZoomSpikeScreen />;
}
