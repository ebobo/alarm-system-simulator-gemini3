/**
 * Realistic "Central Hub" Floor Plan Generator
 * 
 * Strategy:
 * 1. Define a central "Public Area".
 * 2. Define 4 Perimeter Strips (Top, Bottom, Left, Right) for rooms.
 * 3. Reserve one slot in the Bottom strip for the "Main Entrance/Exit".
 * 4. Distribute required rooms (Offices, Meeting, Toilets) into the remaining perimeter space.
 * 5. Split strips into rooms based on "Weights" (Toilets are smaller).
 * 6. Generate SVG.
 */

export interface GeneratorConfig {
    offices: number;
    meetingRooms: number;
    toilets: number;
}

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface Room extends Rect {
    id: string;
    label: string;
    type: 'public' | 'office' | 'meeting' | 'toilet' | 'corridor' | 'entrance' | 'storage' | 'server';
    doorWall?: 'top' | 'bottom' | 'left' | 'right';
}

const WIDTH = 1200;
const HEIGHT = 800;
const RING_THICKNESS = 200;

// Helper: Shuffle array
const shuffle = <T>(array: T[]): T[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

// Helper: Split a strip into weighted rooms with FILLER and MINIMUM WIDTH logic
const processLinearStrip = (
    items: { type: string, weight: number, label: string }[],
    bounds: Rect,
    direction: 'horizontal' | 'vertical',
    doorDir: 'top' | 'bottom' | 'left' | 'right',
    outputList: Room[]
) => {
    if (items.length === 0) return;

    // Constants
    const MIN_TOILET_WIDTH = 100;
    const TOTAL_LENGTH = direction === 'horizontal' ? bounds.w : bounds.h;

    // 1. Initial Allocation
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

    let allocations = items.map(item => ({
        item,
        span: (item.weight / totalWeight) * TOTAL_LENGTH,
        fixed: false
    }));

    // 2. Enforce Minimums
    let hasViolations = false;

    // Check for violations
    allocations.forEach(alloc => {
        if (alloc.item.type === 'toilet' && alloc.span < MIN_TOILET_WIDTH) {
            alloc.span = MIN_TOILET_WIDTH;
            alloc.fixed = true;
            hasViolations = true;
        }
    });

    // Redistribute if needed
    if (hasViolations) {
        let fixedLen = 0;
        let flexibleWeight = 0;

        allocations.forEach(alloc => {
            if (alloc.fixed) {
                fixedLen += alloc.span;
            } else {
                flexibleWeight += alloc.item.weight;
            }
        });

        const remainingLen = TOTAL_LENGTH - fixedLen;

        // If we have flexible rooms and space left, distribute it
        if (remainingLen > 0 && flexibleWeight > 0) {
            allocations.forEach(alloc => {
                if (!alloc.fixed) {
                    alloc.span = (alloc.item.weight / flexibleWeight) * remainingLen;
                }
            });
        }
        // EDGE CASE: If NO space left (overcrowded), we might overlap. 
        // In that case, we keep the 'fixed' sizes and shrink flexible ones to 0 or proportional minimums.
        // For now, assuming reasonable inputs, we proceed.
    }

    // 3. Generate Rooms (with Filler Splitting)
    let currentPos = direction === 'horizontal' ? bounds.x : bounds.y;

    allocations.forEach(alloc => {
        const item = alloc.item;
        const span = alloc.span; // Use the redistributed span

        // Filler Logic: If Toilet is too huge (> 180px), Cap it and add Storage/Server
        if (item.type === 'toilet' && span > 180) {
            const originalSpan = span;
            const cappedSpan = 140; // Force small toilet
            const remainder = originalSpan - cappedSpan;

            // 1. Add Toilet (Capped)
            outputList.push({
                x: direction === 'horizontal' ? currentPos : bounds.x,
                y: direction === 'horizontal' ? bounds.y : currentPos,
                w: direction === 'horizontal' ? cappedSpan : bounds.w,
                h: direction === 'vertical' ? cappedSpan : bounds.h,
                type: 'toilet',
                label: item.label,
                id: `room-${Math.random()}`,
                doorWall: doorDir
            });
            currentPos += cappedSpan;

            // 2. Add Filler in Remainder
            const fillerType = remainder > 160 ? 'server' : 'storage';
            const fillerLabel = fillerType === 'server' ? 'Server' : 'Store';

            outputList.push({
                x: direction === 'horizontal' ? currentPos : bounds.x,
                y: direction === 'horizontal' ? bounds.y : currentPos,
                w: direction === 'horizontal' ? remainder : bounds.w,
                h: direction === 'vertical' ? remainder : bounds.h,
                type: fillerType,
                label: fillerLabel,
                id: `filler-${Math.random()}`,
                doorWall: doorDir
            });
            currentPos += remainder;

        } else {
            // Standard Item
            outputList.push({
                x: direction === 'horizontal' ? currentPos : bounds.x,
                y: direction === 'horizontal' ? bounds.y : currentPos,
                w: direction === 'horizontal' ? span : bounds.w,
                h: direction === 'vertical' ? span : bounds.h,
                type: item.type as any,
                label: item.label,
                id: `room-${Math.random()}`,
                doorWall: doorDir
            });
            currentPos += span;
        }
    });
};

// Helper: Render SVG
const renderSVG = (rooms: Room[]): string => {
    let svg = `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">`;

    // Styles
    svg += `
        <defs>
             <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="1"/>
            </pattern>
        </defs>
        <style>
            .wall { fill: #f8fafc; stroke: #334155; stroke-width: 3; }
            .public { fill: #e0f2fe; stroke: #0284c7; stroke-width: 3; }
            .entrance { fill: #e0f2fe; stroke: #334155; stroke-width: 3; } 
            .office { fill: #f1f5f9; stroke: #334155; stroke-width: 3; }
            .meeting { fill: #f0fdf4; stroke: #16a34a; stroke-width: 3; }
            .toilet { fill: #faf5ff; stroke: #9333ea; stroke-width: 3; }
            .storage { fill: #e2e8f0; stroke: #64748b; stroke-width: 3; }
            .server { fill: #1e293b; stroke: #0f172a; stroke-width: 3; }
            .label { font-family: sans-serif; font-size: 14px; fill: #475569; text-anchor: middle; font-weight: 600; }
            .label-white { font-family: sans-serif; font-size: 12px; fill: #f8fafc; text-anchor: middle; font-weight: 600; }
            .door-swing { stroke: #334155; stroke-width: 2; fill: none; }
            .door-gap { stroke: white; stroke-width: 6; }
            .exit { stroke: #ef4444; stroke-width: 5; }
        </style>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="white"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" />
    `;

    // 1. Render All Room Rectangles First (Background Layer)
    rooms.forEach(r => {
        svg += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" class="${r.type}" />`;
    });

    // 2. Render Overlays (Masking Walls) - Must be AFTER rects
    rooms.forEach(r => {
        // Entrance: Remove wall shared with Public (Top Edge)
        if (r.type === 'entrance') {
            const boundaryY = r.y;
            const boundaryX1 = r.x + 4;
            const boundaryX2 = r.x + r.w - 4;

            // Draw masking line - Thicker to ensure coverage
            svg += `<line x1="${boundaryX1}" y1="${boundaryY}" x2="${boundaryX2}" y2="${boundaryY}" stroke="#e0f2fe" stroke-width="6" />`;
        }
    });

    // 3. Render Doors (Erasers + Swings)
    rooms.forEach(r => {
        if (r.type !== 'public' && r.type !== 'entrance' && r.doorWall) {
            const DOOR_SIZE = 40;
            let gx1 = 0, gy1 = 0, gx2 = 0, gy2 = 0; // positions for gap/eraser

            // Calculate overlap with Public Area to center the door VALIDLY
            const validXStart = RING_THICKNESS;
            const validXEnd = WIDTH - RING_THICKNESS;
            const validYStart = RING_THICKNESS;
            const validYEnd = HEIGHT - RING_THICKNESS;

            if (r.doorWall === 'top') {
                const overlapStart = Math.max(r.x, validXStart);
                const overlapEnd = Math.min(r.x + r.w, validXEnd);
                const mid = (overlapStart + overlapEnd) / 2;

                gx1 = mid - DOOR_SIZE / 2; gy1 = r.y;
                gx2 = mid + DOOR_SIZE / 2; gy2 = r.y;
            }
            else if (r.doorWall === 'bottom') {
                const overlapStart = Math.max(r.x, validXStart);
                const overlapEnd = Math.min(r.x + r.w, validXEnd);
                const mid = (overlapStart + overlapEnd) / 2;

                gx1 = mid - DOOR_SIZE / 2; gy1 = r.y + r.h;
                gx2 = mid + DOOR_SIZE / 2; gy2 = r.y + r.h;
            }
            else if (r.doorWall === 'left') {
                const overlapStart = Math.max(r.y, validYStart);
                const overlapEnd = Math.min(r.y + r.h, validYEnd);
                const mid = (overlapStart + overlapEnd) / 2;

                gx1 = r.x; gy1 = mid - DOOR_SIZE / 2;
                gx2 = r.x; gy2 = mid + DOOR_SIZE / 2;
            }
            else if (r.doorWall === 'right') {
                const overlapStart = Math.max(r.y, validYStart);
                const overlapEnd = Math.min(r.y + r.h, validYEnd);
                const mid = (overlapStart + overlapEnd) / 2;

                gx1 = r.x + r.w; gy1 = mid - DOOR_SIZE / 2;
                gx2 = r.x + r.w; gy2 = mid + DOOR_SIZE / 2;
            }

            // Draw Eraser (White line to break wall)
            svg += `<line x1="${gx1}" y1="${gy1}" x2="${gx2}" y2="${gy2}" class="door-gap" />`;

            // Draw Door Swing
            let path = "";
            if (r.doorWall === 'top') {
                const startX = gx1; const startY = gy1;
                path = `M ${startX} ${startY} v ${DOOR_SIZE} A ${DOOR_SIZE} ${DOOR_SIZE} 0 0 0 ${startX + DOOR_SIZE} ${startY}`;
            }
            else if (r.doorWall === 'bottom') {
                const startX = gx1; const startY = gy1;
                path = `M ${startX} ${startY} v -${DOOR_SIZE} A ${DOOR_SIZE} ${DOOR_SIZE} 0 0 1 ${startX + DOOR_SIZE} ${startY}`;
            }
            else if (r.doorWall === 'left') {
                const startX = gx1; const startY = gy1;
                path = `M ${startX} ${startY} h ${DOOR_SIZE} A ${DOOR_SIZE} ${DOOR_SIZE} 0 0 1 ${startX} ${startY + DOOR_SIZE}`;
            }
            else if (r.doorWall === 'right') {
                const startX = gx1; const startY = gy1;
                path = `M ${startX} ${startY} h -${DOOR_SIZE} A ${DOOR_SIZE} ${DOOR_SIZE} 0 0 0 ${startX} ${startY + DOOR_SIZE}`;
            }

            svg += `<path d="${path}" class="door-swing" />`;
        }
    });

    // 4. Labels and Special Items (Top Layer)
    rooms.forEach(r => {
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;

        if (r.type !== 'entrance') {
            const isDark = r.type === 'server';
            svg += `<text x="${cx}" y="${cy}" class="${isDark ? 'label-white' : 'label'}">${r.label}</text>`;
        } else {
            svg += `<text x="${cx}" y="${cy}" class="label" fill="#0284c7" style="fill:#0284c7">ENTRANCE</text>`;
            // External Exit Door
            const exitY = r.y + r.h;
            const exitX = r.x + r.w / 2;
            svg += `<line x1="${exitX - 40}" y1="${exitY}" x2="${exitX + 40}" y2="${exitY}" class="exit" />`;
            svg += `<text x="${exitX}" y="${exitY - 15}" class="label" fill="#ef4444" style="fill: #ef4444; font-size: 10px;">MAIN EXIT</text>`;
        }
    });

    svg += `</svg>`;
    return svg;
};

export const generateFloorPlanSVG = (config: GeneratorConfig): string => {
    // 1. Define Zones
    // Outer Bounds: 0,0 to WIDTH, HEIGHT
    // Central Hub: Inset by RING_THICKNESS
    const centerRect: Rect = {
        x: RING_THICKNESS,
        y: RING_THICKNESS,
        w: WIDTH - (RING_THICKNESS * 2),
        h: HEIGHT - (RING_THICKNESS * 2)
    };

    interface RoomRequest {
        type: 'office' | 'meeting' | 'toilet';
        count: number;
        weight: number;
    }

    // 2. Prepare Room List
    const requests: RoomRequest[] = [
        { type: 'office', count: config.offices, weight: 1.0 },
        { type: 'meeting', count: config.meetingRooms, weight: 3.0 }, // Huge meeting rooms
        { type: 'toilet', count: config.toilets, weight: 0.4 }     // Tiny toilets
    ];

    let roomQueue: { type: string, weight: number, label: string }[] = [];

    // Fill Queue
    requests.forEach(req => {
        for (let i = 0; i < req.count; i++) {
            roomQueue.push({
                type: req.type,
                weight: req.weight,
                label: req.type === 'office' ? `Office ${i + 1}` : (req.type === 'meeting' ? `Meeting ${i + 1}` : `WC ${i + 1}`)
            });
        }
    });

    // Shuffle queue for random distribution
    roomQueue = shuffle(roomQueue);

    // 3. Distribute to Zones
    const zones: { id: string, rect: Rect, items: typeof roomQueue, doorDir: 'top' | 'bottom' | 'left' | 'right' }[] = [
        { id: 'top', rect: { x: 0, y: 0, w: WIDTH, h: RING_THICKNESS }, items: [], doorDir: 'bottom' },
        { id: 'bottom', rect: { x: 0, y: HEIGHT - RING_THICKNESS, w: WIDTH, h: RING_THICKNESS }, items: [], doorDir: 'top' },
        { id: 'left', rect: { x: 0, y: RING_THICKNESS, w: RING_THICKNESS, h: HEIGHT - RING_THICKNESS * 2 }, items: [], doorDir: 'right' },
        { id: 'right', rect: { x: WIDTH - RING_THICKNESS, y: RING_THICKNESS, w: RING_THICKNESS, h: HEIGHT - RING_THICKNESS * 2 }, items: [], doorDir: 'left' }
    ];

    // Pre-assign Entrance to Bottom Zone (virtual item)
    const ENTRANCE_WIDTH = 250; // Wider entrance

    // Distribute rooms
    let zIdx = 0;
    while (roomQueue.length > 0) {
        zones[zIdx].items.push(roomQueue.pop()!);
        zIdx = (zIdx + 1) % 4;
    }

    // 4. Generate Final Rooms
    const finalRooms: Room[] = [];

    zones.forEach(zone => {
        let effectiveH = zone.rect.h;
        let startY = zone.rect.y;

        // If Bottom zone, we need to place Entrance
        if (zone.id === 'bottom') {
            const entranceX = (WIDTH / 2) - (ENTRANCE_WIDTH / 2);
            finalRooms.push({
                x: entranceX,
                y: startY,
                w: ENTRANCE_WIDTH,
                h: effectiveH,
                type: 'entrance',
                label: 'Entrance',
                id: 'entrance'
            });

            // Now we have two sub-zones: Bottom-Left and Bottom-Right
            const mid = Math.ceil(zone.items.length / 2);
            const leftItems = zone.items.slice(0, mid);
            const rightItems = zone.items.slice(mid);

            // Process Bottom-Left
            processLinearStrip(
                leftItems,
                { x: 0, y: startY, w: entranceX, h: effectiveH },
                'horizontal',
                zone.doorDir,
                finalRooms
            );

            // Process Bottom-Right
            processLinearStrip(
                rightItems,
                { x: entranceX + ENTRANCE_WIDTH, y: startY, w: WIDTH - (entranceX + ENTRANCE_WIDTH), h: effectiveH },
                'horizontal',
                zone.doorDir,
                finalRooms
            );
        } else {
            // Standard Zones
            const isHoriz = zone.id === 'top' || zone.id === 'bottom';
            processLinearStrip(
                zone.items,
                zone.rect,
                isHoriz ? 'horizontal' : 'vertical',
                zone.doorDir,
                finalRooms
            );
        }
    });

    // 5. Add Public Area
    finalRooms.push({
        x: centerRect.x,
        y: centerRect.y,
        w: centerRect.w,
        h: centerRect.h,
        type: 'public',
        id: 'public',
        label: 'Public Area'
    });

    // 6. Output SVG
    return renderSVG(finalRooms);
};
