import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DeviceNode } from './DeviceNode';
import type { PlacedDevice } from '../types/device';
import { DEVICE_DEFINITIONS } from '../config/devices';

interface DraggableDeviceProps {
    device: PlacedDevice;
    onTerminalMouseDown?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
    onTerminalMouseUp?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
}

export const DraggableDevice: React.FC<DraggableDeviceProps> = ({ device, onTerminalMouseDown, onTerminalMouseUp }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: device.id,
        data: {
            isPlacedDevice: true,
            device
        }
    });

    const def = DEVICE_DEFINITIONS[device.typeId];

    const style: React.CSSProperties = {
        left: device.x,
        top: device.y,
        width: def?.width ?? 32,
        height: def?.height ?? 32,
        opacity: isDragging ? 0 : 1, // Hide original when dragging (ghost follows mouse)
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: transform
            ? `translate(-50%, -50%) translate3d(${transform.x}px, ${transform.y}px, 0)`
            : 'translate(-50%, -50%)',
        position: 'absolute',
        touchAction: 'none',
        pointerEvents: 'auto' as const
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <DeviceNode
                typeId={device.typeId}
                rotation={device.rotation}
                onTerminalMouseDown={(tid, e) => onTerminalMouseDown?.(device.id, tid, e)}
                onTerminalMouseUp={(tid, e) => onTerminalMouseUp?.(device.id, tid, e)}
            />
        </div>
    );
};
