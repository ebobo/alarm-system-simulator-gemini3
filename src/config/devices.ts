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
    // Pair 1 (Top Right)
    { id: '1+', x: 10, y: -16, label: '+', isPositive: true, pairIndex: 0 },
    { id: '1-', x: 16, y: -10, label: '-', isPositive: false, pairIndex: 0 },
    // Pair 2 (Bottom Right)
    { id: '2+', x: 16, y: 10, label: '+', isPositive: true, pairIndex: 1 },
    { id: '2-', x: 10, y: 16, label: '-', isPositive: false, pairIndex: 1 },
    // Pair 3 (Bottom Left)
    { id: '3+', x: -10, y: 16, label: '+', isPositive: true, pairIndex: 2 },
    { id: '3-', x: -16, y: 10, label: '-', isPositive: false, pairIndex: 2 },
    // Pair 4 (Top Left)
    { id: '4+', x: -16, y: -10, label: '+', isPositive: true, pairIndex: 3 },
    { id: '4-', x: -10, y: -16, label: '-', isPositive: false, pairIndex: 3 },
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
