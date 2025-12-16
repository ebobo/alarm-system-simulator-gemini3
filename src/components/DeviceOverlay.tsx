import React from 'react';
import type { PlacedDevice } from '../types/device';
import { DraggableDevice } from './DraggableDevice';

interface DeviceOverlayProps {
    devices: PlacedDevice[];
    onTerminalMouseDown?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
    onTerminalMouseUp?: (deviceId: string, terminalId: string, event: React.MouseEvent) => void;
}

export const DeviceOverlay: React.FC<DeviceOverlayProps> = ({ devices, onTerminalMouseDown, onTerminalMouseUp }) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {devices.map((device) => (
                <DraggableDevice
                    key={device.id}
                    device={device}
                    onTerminalMouseDown={onTerminalMouseDown}
                    onTerminalMouseUp={onTerminalMouseUp}
                />
            ))}
        </div>
    );
};
