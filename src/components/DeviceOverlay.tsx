import React from 'react';
import type { PlacedDevice } from '../types/device';
import { DEVICE_DEFINITIONS } from '../config/devices';

interface DeviceOverlayProps {
    devices: PlacedDevice[];
    onTerminalMouseDown?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
    onTerminalMouseUp?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
}

export const DeviceOverlay: React.FC<DeviceOverlayProps> = ({ devices, onTerminalMouseDown, onTerminalMouseUp }) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {devices.map((device) => {
                const def = DEVICE_DEFINITIONS[device.typeId];
                if (!def) return null;

                return (
                    <div
                        key={device.id}
                        className="absolute flex items-center justify-center pointer-events-auto cursor-move group"
                        style={{
                            left: device.x,
                            top: device.y,
                            width: def.width,
                            height: def.height,
                            transform: `translate(-50%, -50%) rotate(${device.rotation || 0}deg)`,
                        }}
                    >
                        {/* Terminals - Rendered relative to the device center (container) */}
                        {def.terminals.map((t) => (
                            <div
                                key={t.id}
                                title={`Terminal ${t.id} (${t.label})`}
                                className="absolute w-2 h-2 rounded-full border border-slate-600 transition-all duration-200 hover:scale-[2.5] hover:z-10 cursor-crosshair bg-slate-500 hover:bg-slate-700 pointer-events-auto"
                                style={{
                                    left: `calc(50% + ${t.x}px)`,
                                    top: `calc(50% + ${t.y}px)`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 5 // Ensure above the body shadow
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation(); // Prevent device drag start
                                    onTerminalMouseDown?.(device.id, t.id, e);
                                }}
                                onMouseUp={(e) => {
                                    onTerminalMouseUp?.(device.id, t.id, e);
                                }}
                            />
                        ))}

                        {/* Visual Body */}
                        <div className="w-full h-full rounded-full bg-white border-2 border-slate-700 shadow-sm relative transition-shadow hover:shadow-md z-0">
                            {/* Center Icon/Label */}
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-500 select-none">
                                AG
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
