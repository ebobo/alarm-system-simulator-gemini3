import React from 'react';
import type { PlacedDevice } from '../types/device';
import { DEVICE_DEFINITIONS } from '../config/devices';

interface DeviceOverlayProps {
    devices: PlacedDevice[];
}

export const DeviceOverlay: React.FC<DeviceOverlayProps> = ({ devices }) => {
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
                            // Verify: device.x/y is center? If so, we need to offset by half width/height
                            // Standard practice for points is usually x,y is the anchor.
                            // Let's assume x,y is the CENTER of the device.
                            transform: `translate(-50%, -50%) rotate(${device.rotation || 0}deg)`,
                        }}
                    >
                        {/* Visual Body */}
                        <div className="w-full h-full rounded-full bg-white border-2 border-slate-700 shadow-sm relative transition-shadow hover:shadow-md">

                            {/* Terminals */}
                            {def.terminals.map((t) => (
                                <div
                                    key={t.id}
                                    title={`Terminal ${t.id} (${t.label})`}
                                    className={`absolute w-1.5 h-1.5 rounded-full border border-slate-500 ${t.isPositive ? 'bg-red-500' : 'bg-black'
                                        }`}
                                    style={{
                                        left: `calc(50% + ${t.x}px)`,
                                        top: `calc(50% + ${t.y}px)`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                />
                            ))}

                            {/* Center Icon/Label */}
                            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                AG
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
