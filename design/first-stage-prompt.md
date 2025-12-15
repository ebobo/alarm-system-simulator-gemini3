# Prompt for Recreating the Fire Alarm App (Stage 1)

**Context**: You are an expert React/TypeScript developer specializing in algorithmic geometry and interactive SVG visualizations.

**Objective**: Build a "Fire Alarm System Simulation" web app. The current goal is **Stage 1**: A robust Floor Plan Viewer and a highly realistic "One-Click" Random Floor Plan Generator.

**Tech Stack**:
*   React 18 + TypeScript + Vite
*   Tailwind CSS
*   `react-zoom-pan-pinch` (for pan/zoom interactions)

---

## Instructions

### Part 1: The Viewer Infrastructure
1.  Initialize a new Vite project.
2.  Create a `FloorPlanViewer` component using `react-zoom-pan-pinch` to display SVG content with smooth mouse-wheel zooming and panning.
3.  Add controls for "Zoom In", "Zoom Out", and "Reset".
4.  Create a sidebar to select different plans (start with a "Generated" option).

### Part 2: The "Realistic" Floor Plan Generator
Create a utility `floorPlanGenerator.ts` that generates an SVG string. It must NOT be a simple grid. It must follow this specific "Central Hub" architecture to ensure realism:

**Architecture**:
*   **Zones**: A central "Public Area" (Corridor) surrounded by 4 perimeter strips (Top, Bottom, Left, Right).
*   **Entrance**: A fixed "Main Entrance" in the bottom strip.
*   **Connectivity**: All rooms must directly touch the central Public Area.

**Refinement Rules (Crucial)**:
You must implement the following specific logic to pass the user's quality checks:

1.  **Room Sizing**:
    *   **Meeting Rooms**: Must be **large** (approx 3.0x the size of an office).
    *   **Toilets**: Must be **small** (0.4x office), but...
    *   **Minimum Width Constraint**: A toilet MUST be at least **100px** wide (approx 2.5x door width). If the algorithm attempts to make it smaller, force it to 100px and shrink other rooms in the row.

2.  **Filler Logic (No Giant Toilets)**:
    *   If a strip has leftover space that would stretch a Toilet to be > 180px, you must **SPLIT** the space.
    *   Keep the toilet small (140px) and convert the remaining space into a **"Server Room"** or **"Storage Room"**.

3.  **Visuals**:
    *   **Open Lobby**: The wall between the "Entrance" and "Public Area" must be visually removed (masked) to create an open lobby effect.
    *   **Doors**: Do not use simple lines. Render **SVG Arcs** (quarter-circles) to show door swings.

4.  **Smart Door Placement (The "Clamping" Rule)**:
    *   Doors must explicitly open into the Public Area.
    *   Calculate the geometric **intersection** between the Room's wall and the Public Area.
    *   Clamp the door's position to this intersection. This prevents "Corner Doors" from opening into a neighbor's wall.

### Part 3: Configuration
*   Add a Modal to configure the number of rooms.
*   **Defaults**: 6 Offices, 2 Meeting Rooms, 3 Toilets.
*   On app launch, immediately generate a unique plan using these defaults.

---

**Output**:
Please produce the full code for `floorPlanGenerator.ts` implementing all the algorithmic constraints above, and the React components to display it.
