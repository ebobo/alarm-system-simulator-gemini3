import React from 'react';
import { DEVICE_DEFINITIONS } from '../config/devices';
import type { DeviceTypeId } from '../types/device';

interface DeviceNodeProps {
    typeId: DeviceTypeId;
    rotation?: number;
    className?: string;
    style?: React.CSSProperties;
    onTerminalMouseDown?: (terminalId: string, event: React.MouseEvent) => void;
    onTerminalMouseUp?: (terminalId: string, event: React.MouseEvent) => void;
}

export const DeviceNode: React.FC<DeviceNodeProps> = ({
    typeId,
    rotation = 0,
    className,
    style,
    onTerminalMouseDown,
    onTerminalMouseUp
}) => {
    const def = DEVICE_DEFINITIONS[typeId];
    if (!def) return null;

    return (
        <div
            className={`absolute flex items-center justify-center group select-none ${className || ''}`}
            style={{
                width: def.width,
                height: def.height,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                ...style
            }}
        >
            {/* Terminals */}
            {def.terminals.map((t) => (
                <div
                    key={t.id}
                    title={`Terminal ${t.id} (${t.label})`}
                    className="absolute w-2 h-2 rounded-full border border-slate-600 transition-all duration-200 hover:scale-[2.5] hover:z-10 cursor-crosshair bg-slate-500 hover:bg-slate-700 pointer-events-auto"
                    style={{
                        left: `calc(50% + ${t.x}px)`,
                        top: `calc(50% + ${t.y}px)`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onTerminalMouseDown?.(t.id, e);
                    }}
                    onMouseUp={(e) => {
                        onTerminalMouseUp?.(t.id, e);
                    }}
                />
            ))}

            {/* Visual Body */}
            <div className="w-full h-full rounded-full bg-white border-2 border-slate-700 shadow-sm relative transition-shadow hover:shadow-md z-0 overflow-hidden">
                {/* Center Icon/Label */}
                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-500 select-none pointer-events-none">
                    AG
                </div>
            </div>
        </div>
    );
};
