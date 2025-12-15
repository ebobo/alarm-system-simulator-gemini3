export type DeviceId = string;
export type DeviceTypeId = 'autroguard-base';

export interface Terminal {
    id: string; // e.g. "1+", "1-", "2+", "2-"
    x: number; // Relative to device center or top-left (we'll assume relative to center for symmetry)
    y: number;
    label: string;
    isPositive: boolean;
    pairIndex: number; // 0-3 for the 4 pairs
}

export interface DeviceTypeDefinition {
    typeId: DeviceTypeId;
    name: string;
    width: number;
    height: number;
    terminals: Terminal[];
    // We can add icon rendering info later, for now we might just assume a placeholder or simple shape
}

export interface PlacedDevice {
    id: DeviceId;
    typeId: DeviceTypeId;
    x: number; // Plan coordinates (center X)
    y: number; // Plan coordinates (center Y)
    rotation?: number; // In degrees, default 0
}

// Coordinate in Plan space
export interface Point {
    x: number;
    y: number;
}

export interface Wire {
    id: string;
    startDeviceId: string;
    startTerminalId: string;
    endDeviceId: string;
    endTerminalId: string;
}

export interface ActiveWire {
    startDeviceId: string;
    startTerminalId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}
