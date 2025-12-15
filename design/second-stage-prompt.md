TASK
	•	Act as a senior React/TypeScript engineer and UI architect.
	•	Plan and implement the next step of my floor-plan viewer app:
	•	A right-side “Device Box” palette of loop devices
	•	Drag-and-drop devices from the palette onto the floor plan
	•	Render a placed device with connection points (terminals) that will later be used to draw wires
	•	Start with the first supported device: AutroGuard detector base icon with 4 wire-pairs (+/-) = 8 terminals total.

GOAL
	•	I can drag an “AutroGuard Base” from a right-side panel and drop it onto the floor plan.
	•	The dropped device appears at the correct position on the plan (respecting current zoom/pan).
	•	The device renders 8 visible connection points arranged as 4 (+/-) pairs, suitable for later “wire drawing”.

CONTEXT
	•	I already have a React app that displays a 2D floor plan and supports pan/zoom.
	•	This app will become an Autronica fire alarm loop simulator where users place devices, connect wires, configure, and run simulations.
	•	Device documentation provided: AutroGuard V-430 datasheet (PDF):  ￼ (use it only for context; the core requirement here is UI drag/drop + connection points).

INPUT
	•	Current floor plan viewer has:
	•	A background plan image (SVG)
	•	Zoom + pan transforms
	•	First draggable device:
	•	Name: AutroGuard Base
	•	Visual: simple icon is OK (SVG/PNG placeholder acceptable)
	•	Terminals: 4 pairs of (-/+) connection points (8 total)

CONSTRAINTS
	•	Must work smoothly with zoom/pan.
	•	Keep dependencies minimal; use one drag/drop library if helpful.
	•	Prefer @dnd-kit (or justify an alternative).
	•	Store device positions in plan/world coordinates (not screen pixels) so positions remain stable while zooming/panning.
	•	Architecture must support future additions:
	•	More device types (loop driver, sounders, I/O modules, etc.)
	•	Selecting/moving devices after placement
	•	Wiring between connection points
	•	Saving/loading layout state (JSON)

OUTPUT FORMAT (STRICT)

Provide the following sections in order:
	1.	High-level design (bullets)
	•	Component architecture (palette, canvas/viewer, overlay layer)
	•	Data model for devices and terminals
	•	How drag/drop integrates with pan/zoom
	2.	Dependencies
	•	Exact packages to install (and why)
	•	If zero-dependency approach, explain how you’ll implement DnD reliably
	3.	Data structures (TypeScript)
	•	DeviceType, PlacedDevice, Terminal (include polarity, pair index, relative position)
	•	Viewport transform type (scale, translateX/Y) and coordinate conversion helpers
	4.	Step-by-step implementation plan
	•	Ordered steps with clear milestones
	•	Include how to validate each step visually
	5.	Code changes (copy-paste ready)
	•	Show updated/added files with full code
	•	Must include:
	•	DevicePalette (right-side panel)
	•	FloorPlanCanvas / viewer integration
	•	DeviceOverlay renderer that draws devices + terminals above the plan
	•	useViewportTransform (or equivalent) with conversion: screen ⇄ plan coords
	•	State management for placed devices (local state is fine; structure it so it can be replaced later)
	6.	Interaction details
	•	How dropping computes the correct plan coordinate under cursor
	•	How terminals are rendered (size, hit area, labels +/-)
	•	Minimum UX: highlight droppable area on drag; show device ghost/preview if possible
	7.	Acceptance criteria
	•	Bullet list of “done” checks:
	•	Drop location matches cursor even when zoomed/panned
	•	Devices persist correctly when zoom changes
	•	Terminals appear as 4 (+/-) pairs (8 points) and remain attached to device when moving/zooming
	8.	Next-step hooks (bullets)
	•	How you would extend to:
	•	Selecting a device
	•	Dragging/moving placed devices
	•	Clicking a terminal to start a wire
	•	Snapping wires to terminals
	•	Export/import layout JSON

QUALITY BAR
	•	Code must be clean, typed, and maintainable.
	•	Coordinate math must be correct and explained (briefly) in code comments.
	•	UI must remain responsive; avoid re-rendering the entire plan unnecessarily.
	•	Overlay rendering should be designed to scale (SVG overlay or canvas overlay is OK; justify choice).

ASSUMPTIONS
	•	The floor plan viewer already exposes (or can be updated to expose) the current viewport transform { scale, translateX, translateY }.
	•	The plan is rendered in a container with a known bounding box so drop coordinates can be computed relative to it.
	•	For terminal layout on the AutroGuard base:
	•	You may assume a simple symmetric arrangement (e.g., 4 pairs around the icon) using relative coordinates on the device’s local coordinate system.
	•	No wiring is implemented yet—only terminal visualization and correct placement.