import type { DeviceTypeDefinition, Terminal } from '../types/device';

const BASE_WIDTH = 40;
const BASE_HEIGHT = 40;


// Helper to create circular terminal layout
// 4 pairs, 8 terminals total.
// Let's arrange them in a circle? Or maybe corners?
// The prompt says "straight lines" usually but let's go with a distributed circle for the base.
// Actually, let's keep it simple: 4 corners, each corner has a pair.
// Or just 8 points in a circle.
// Let's do 4 pairs distributed: Top-Right, Bottom-Right, Bottom-Left, Top-Left.

const terminals: Terminal[] = [
    // Top
    { id: 'T', x: 0, y: -16, label: 'Top', isPositive: true, pairIndex: 0 },
    // Right
    { id: 'R', x: 16, y: 0, label: 'Right', isPositive: true, pairIndex: 1 },
    // Bottom
    { id: 'B', x: 0, y: 16, label: 'Bottom', isPositive: true, pairIndex: 2 },
    // Left
    { id: 'L', x: -16, y: 0, label: 'Left', isPositive: true, pairIndex: 3 },
];

export const DEVICE_DEFINITIONS: Record<string, DeviceTypeDefinition> = {
    'autroguard-base': {
        typeId: 'autroguard-base',
        name: 'AutroGuard Base',
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        terminals
    }
};
