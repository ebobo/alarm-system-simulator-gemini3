import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { DEVICE_DEFINITIONS } from '../config/devices';
import type { DeviceTypeId } from '../types/device';


interface DraggableDeviceProps {
    typeId: DeviceTypeId;
}

const DraggableDeviceItem: React.FC<DraggableDeviceProps> = ({ typeId }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${typeId}`,
        data: {
            typeId,
            isPaletteItem: true,
        },
    });

    const style: React.CSSProperties = {
        opacity: isDragging ? 0 : 1,
    };

    const deviceDef = DEVICE_DEFINITIONS[typeId];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm cursor-grab hover:border-slate-300 hover:shadow-md transition-all active:cursor-grabbing"
        >
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300 relative">
                {/* Simplified visual representation of the device */}
                <div className="w-6 h-6 rounded-full border border-slate-400 bg-white"></div>
                {/* 4 distinct dots for terminals visually */}
                <div className="absolute top-[2px] right-[2px] w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <div className="absolute bottom-[2px] right-[2px] w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <div className="absolute bottom-[2px] left-[2px] w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <div className="absolute top-[2px] left-[2px] w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-slate-700">{deviceDef.name}</span>
        </div>
    );
};

export const DevicePalette: React.FC = () => {
    return (
        <div className="w-64 bg-slate-50 border-l border-slate-200 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 bg-white">
                <h2 className="font-semibold text-slate-800">Loop Devices</h2>
                <p className="text-xs text-slate-500 mt-1">Drag devices to the floor plan</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {Object.keys(DEVICE_DEFINITIONS).map((typeId) => (
                    <DraggableDeviceItem key={typeId} typeId={typeId as DeviceTypeId} />
                ))}
            </div>
        </div>
    );
};
