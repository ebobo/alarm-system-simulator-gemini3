# Implementation Plan - Autronica Floor Plan Viewer

## Goal Description
Build the foundational **React web app** for the Autronica simulator. The immediate goal is a robust **2D Floor Plan Viewer** supporting smooth zoom/pan interaction, "fit to screen" functionality, and a coordinate system capable of supporting future overlays (detectors, wiring).

## User Review Required
> [!IMPORTANT]
> **Library Selection**: I strongly recommend using **`react-zoom-pan-pinch`**.
> *   **Why**: It provides battle-tested smooth zooming (wheel, touch, pinch), bounds control (prevent losing the image), and accessible controls out of the box. Building this from scratch accurately (handling multi-touch pinch, matrix transforms) is error-prone and time-consuming.
> *   **Alternative**: Manual `transform: matrix(...)` implementation (higher effort, potentially jittery without optimizing for all input devices).

> [!NOTE]
> **Asset Strategy**: **SVG First**.
> *   KVGs (Vector) allow infinite scaling without pixelation, which is crucial for zooming into specific wiring details later.
> *   We will support `<img>` tags (PNG/JPG) within the wrapper as well for flexibility.

## Proposed Changes

### Tech Stack
*   **Framework**: React 18
*   **Build Tool**: Vite + TypeScript
*   **Styling**: Tailwind CSS (for rapid, clean UI layout)
*   **Key Libs**: `react-zoom-pan-pinch`, `lucide-react` (for nice icons in controls)

### Component Architecture

#### [NEW] `src/components/FloorPlanViewer.tsx`
*   Core wrapper using `TransformWrapper` and `TransformComponent` from the library.
*   Props: `imageUrl` (or generic children), `initialScale`.
*   Exposes ref for controls (reset, zoomIn, zoomOut).
*   **Layering**: This component will wrap a generic "Content" div. Later, we can stack the Floor Plan Image + Detector Layer + Wiring Canvas inside this same transformed coordinate space.

#### [NEW] `src/components/PlanSelector.tsx`
*   Simple sidebar or dropdown to switch between sample floor plans (e.g., "Ground Floor", "Level 1").

#### [NEW] `src/App.tsx`
*   Main layout.
*   Manages state: `activePlanId`.
*   Renders `PlanSelector` and `FloorPlanViewer`.
*   Overlays the "Zoom Controls" (floating UI) on top of the viewer area.

#### [NEW] `src/utils/coordinates.ts`
*   Functions to map screen coordinates to plan coordinates.
*   `screenToPlan(x, y, transformState)`: Crucial for later "drag and drop" of detectors.

## Setup Steps
1.  `npm create vite@latest . -- --template react-ts`
2.  `npm install`
3.  `npm install react-zoom-pan-pinch lucide-react`
4.  `npm install -D tailwindcss postcss autoprefixer`
5.  `npx tailwindcss init -p`

## Verification Plan
### Automated Tests
*   We will rely on manual verification for the visual interactions as we are setting up the UI skeleton.
*   Ensure build passes `npm run build`.

### Manual Verification
*   **Pan**: Dragging the plan should move it.
*   **Zoom**: Mouse wheel and button clicks should scale the plan clearly.
*   **Bounds**: Panning should be constrained so the plan doesn't disappear off-screen.
*   **Switching**: Changing plans should reset the view or maintain reasonable state.
