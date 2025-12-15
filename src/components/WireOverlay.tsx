import React from 'react';
import type { Wire, ActiveWire, PlacedDevice } from '../types/device';
import { DEVICE_DEFINITIONS } from '../config/devices';

interface WireOverlayProps {
    wires: Wire[];
    activeWire: ActiveWire | null;
    devices: PlacedDevice[];
    width?: number; // Optional, might use 100%
    height?: number; // Optional
}

export const WireOverlay: React.FC<WireOverlayProps> = ({ wires, activeWire, devices }) => {
    // Helper to get terminal absolute position
    const getTerminalPosition = (deviceId: string, terminalId: string) => {
        const device = devices.find(d => d.id === deviceId);
        if (!device) return null;

        const def = DEVICE_DEFINITIONS[device.typeId];
        if (!def) return null;

        const terminal = def.terminals.find(t => t.id === terminalId);
        if (!terminal) return null;

        // Device x/y is center
        // Terminal x/y is relative to center
        return {
            x: device.x + terminal.x,
            y: device.y + terminal.y
        };
    };

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {/* Completed Wires */}
            {wires.map(wire => {
                const start = getTerminalPosition(wire.startDeviceId, wire.startTerminalId);
                const end = getTerminalPosition(wire.endDeviceId, wire.endTerminalId);

                if (!start || !end) return null;

                return (
                    <line
                        key={wire.id}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="#64748b" // slate-500
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                );
            })}

            {/* Active Wire (Dragging) */}
            {activeWire && (
                <line
                    x1={activeWire.startX}
                    y1={activeWire.startY}
                    x2={activeWire.currentX}
                    y2={activeWire.currentY}
                    stroke="#94a3b8" // slate-400 (lighter)
                    strokeWidth="2"
                    strokeDasharray="4 2" // Dashed for active
                    strokeLinecap="round"
                />
            )}
        </svg>
    );
};
