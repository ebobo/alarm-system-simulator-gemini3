import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { DeviceNode } from './DeviceNode';
import type { PlacedDevice } from '../types/device';

interface DraggableDeviceProps {
    device: PlacedDevice;
    onTerminalMouseDown?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
    onTerminalMouseUp?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
}

export const DraggableDevice: React.FC<DraggableDeviceProps> = ({ device, onTerminalMouseDown, onTerminalMouseUp }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: device.id,
        data: {
            isPlacedDevice: true,
            device
        }
    });

    const style: React.CSSProperties = {
        left: device.x,
        top: device.y,
        opacity: isDragging ? 0 : 1, // Hide original when dragging (ghost follows mouse)
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} className="absolute" {...listeners} {...attributes}>
            {/* Note: DeviceNode has absolute positioning + translate(-50%, -50%) inside, so we just set left/top on wrapper?
                 Actually, DeviceNode expects to be absolute.
                 Let's make sure the wrapper positioning is correct.
                 If wrapper is absolute at left/top, DeviceNode inside with translate(-50%, -50%) will center itself on that point.
                 Wait, if wrapper is div, it has width 0?
                 Best to apply refs to the DeviceNode root if possible, or wrap.
                 Let's keep the wrapper simple.
             */}
            <DeviceNode
                typeId={device.typeId}
                rotation={device.rotation}
                // Pass simple handlers that inject deviceId
                onTerminalMouseDown={(tid, e) => onTerminalMouseDown?.(device.id, tid, e)}
                onTerminalMouseUp={(tid, e) => onTerminalMouseUp?.(device.id, tid, e)}
            />
        </div>
    );
};
