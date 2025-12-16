import { useState, useRef, useEffect, useCallback } from 'react';
import { FloorPlanViewer } from './components/FloorPlanViewer';
import { PlanSelector } from './components/PlanSelector';
import type { Plan } from './components/PlanSelector';
import { generateFloorPlanSVG, type GeneratorConfig } from './utils/floorPlanGenerator';
import { GenerationModal } from './components/GenerationModal';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, type DragEndEvent } from '@dnd-kit/core';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { DevicePalette } from './components/DevicePalette';
import { DeviceOverlay } from './components/DeviceOverlay';
import { DeviceNode } from './components/DeviceNode';
import { WireOverlay } from './components/WireOverlay';
import type { PlacedDevice, DeviceTypeId, Wire, ActiveWire } from './types/device';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { DEVICE_DEFINITIONS } from './config/devices';

// Sample data
const generateDefaultPlan = (): Plan[] => {
  const config = { offices: 6, meetingRooms: 2, toilets: 3 };
  const svg = generateFloorPlanSVG(config);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return [
    {
      id: 'generated-default',
      name: 'Generated Main Floor',
      imageUrl: URL.createObjectURL(blob),
      isCustom: false
    }
  ];
};

const DEFAULT_PLANS: Plan[] = generateDefaultPlan();

function App() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [activePlanId, setActivePlanId] = useState<string>(DEFAULT_PLANS[0].id);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  // Device State
  const [placedDevices, setPlacedDevices] = useState<PlacedDevice[]>([]);
  const [activeDragType, setActiveDragType] = useState<DeviceTypeId | null>(null);
  const [activeDragDevice, setActiveDragDevice] = useState<PlacedDevice | null>(null);

  // Wire State
  const [wires, setWires] = useState<Wire[]>([]);
  const [activeWire, setActiveWire] = useState<ActiveWire | null>(null);

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0];
  const floorPlanRef = useRef<ReactZoomPanPinchRef>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Helper to convert screen to plan coordinates
  const screenToPlan = useCallback((screenX: number, screenY: number) => {
    const transformState = floorPlanRef.current?.instance.transformState;
    const contentNode = document.getElementById('floor-plan-content');

    if (transformState && contentNode) {
      const contentRect = contentNode.getBoundingClientRect();
      const scale = transformState.scale;
      return {
        x: (screenX - contentRect.left) / scale,
        y: (screenY - contentRect.top) / scale
      };
    }
    return null;
  }, []);

  // Wiring Handlers
  const handleTerminalMouseDown = (deviceId: string, terminalId: string, event: React.MouseEvent) => {
    const device = placedDevices.find(d => d.id === deviceId);
    if (!device) return;

    const def = DEVICE_DEFINITIONS[device.typeId];
    const terminal = def.terminals.find(t => t.id === terminalId);
    if (!terminal) return;

    const startX = device.x + terminal.x;
    const startY = device.y + terminal.y;

    setActiveWire({
      startDeviceId: deviceId,
      startTerminalId: terminalId,
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });
  };

  const handleTerminalMouseUp = (deviceId: string, terminalId: string, event: React.MouseEvent) => {
    if (activeWire) {
      // Verify we aren't connecting to the same terminal (or same device if we want to forbid self-loops)
      if (activeWire.startDeviceId === deviceId && activeWire.startTerminalId === terminalId) {
        setActiveWire(null);
        return;
      }

      const newWire: Wire = {
        id: `wire-${Date.now()}`,
        startDeviceId: activeWire.startDeviceId,
        startTerminalId: activeWire.startTerminalId,
        endDeviceId: deviceId,
        endTerminalId: terminalId
      };

      setWires(prev => [...prev, newWire]);
      setActiveWire(null);
    }
  };

  // Global mouse move/up for wiring
  useEffect(() => {
    if (!activeWire) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const coords = screenToPlan(e.clientX, e.clientY);
      if (coords) {
        setActiveWire(prev => prev ? {
          ...prev,
          currentX: coords.x,
          currentY: coords.y
        } : null);
      }
    };

    const handleWindowMouseUp = () => {
      setActiveWire(null);
    };

    // Add listeners
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [activeWire, screenToPlan]);


  const handleFileUpload = (file: File) => {
    const newPlanId = `custom-${Date.now()}`;
    const objectUrl = URL.createObjectURL(file);
    const newPlan: Plan = {
      id: newPlanId,
      name: file.name,
      imageUrl: objectUrl,
      isCustom: true
    };

    setPlans(prev => [...prev, newPlan]);
    setActivePlanId(newPlanId);
  };

  const handleGeneratePlan = (config: GeneratorConfig) => {
    const svgString = generateFloorPlanSVG(config);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const objectUrl = URL.createObjectURL(blob);
    const newPlanId = `gen-${Date.now()}`;
    const summary = `${config.offices} Off, ${config.meetingRooms} Mtg`;

    const newPlan: Plan = {
      id: newPlanId,
      name: `Generated (${summary})`,
      imageUrl: objectUrl,
      isCustom: true
    };

    setPlans(prev => [...prev, newPlan]);
    setActivePlanId(newPlanId);
  };

  const handleDeletePlan = (idToDelete: string) => {
    setPlans(prev => {
      const planToDelete = prev.find(p => p.id === idToDelete);
      if (planToDelete?.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(planToDelete.imageUrl);
      }
      return prev.filter(p => p.id !== idToDelete);
    });

    if (activePlanId === idToDelete) {
      setActivePlanId(DEFAULT_PLANS[0].id);
    }
  };

  const handleDragStart = (event: any) => {
    if (event.active.data.current?.isPaletteItem) {
      setActiveDragType(event.active.data.current.typeId);
      setActiveDragDevice(null);
    } else if (event.active.data.current?.isPlacedDevice) {
      setActiveDragType(event.active.data.current.device.typeId);
      setActiveDragDevice(event.active.data.current.device);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    setActiveDragDevice(null);
    const { active, over } = event;

    if (!over || over.id !== 'floor-plan-droppable') return;

    const dropRect = event.active.rect.current.translated;
    if (!dropRect) return;

    // dropRect is the final client rect of the dragged element (DraggableDevice div).
    // DraggableDevice div is sized to the device (e.g. 32x32) and centered on x,y.
    // dropRect.left, dropRect.top is the top-left of that box.
    // Center is left + width/2.
    const dropX = dropRect.left + dropRect.width / 2;
    const dropY = dropRect.top + dropRect.height / 2;

    const transformState = floorPlanRef.current?.instance.transformState;
    const contentNode = document.getElementById('floor-plan-content');

    if (transformState && contentNode) {
      const contentRect = contentNode.getBoundingClientRect();
      const scale = transformState.scale;

      const planX = (dropX - contentRect.left) / scale;
      const planY = (dropY - contentRect.top) / scale;

      if (active.data.current?.isPaletteItem) {
        const newDevice: PlacedDevice = {
          id: `dev-${Date.now()}`,
          typeId: active.data.current?.typeId || 'autroguard-base',
          x: planX,
          y: planY,
          rotation: 0
        };
        setPlacedDevices(prev => [...prev, newDevice]);
      } else if (active.data.current?.isPlacedDevice) {
        setPlacedDevices(prev => prev.map(d => {
          if (d.id === active.id) {
            return { ...d, x: planX, y: planY };
          }
          return d;
        }));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-screen h-screen flex flex-col bg-slate-900">
        <div className="flex-1 relative overflow-hidden flex">
          {/* Sidebar Controls (Left) */}
          <div className="flex flex-col h-full bg-white z-10 shadow-lg border-r border-slate-200">
            <PlanSelector
              plans={plans}
              activePlanId={activePlanId}
              onSelectPlan={setActivePlanId}
              onFileUpload={handleFileUpload}
              onDeletePlan={handleDeletePlan}
              onGenerateRandom={() => setIsGeneratorOpen(true)}
            />
          </div>

          {/* Main Viewer Area */}
          <div className="flex-1 relative h-full">
            <FloorPlanViewer
              ref={floorPlanRef}
              key={activePlanId}
              imageUrl={activePlan.imageUrl}
            >
              <WireOverlay
                wires={wires}
                activeWire={activeWire}
                devices={placedDevices}
              />
              <DeviceOverlay
                devices={placedDevices}
                onTerminalMouseDown={handleTerminalMouseDown}
                onTerminalMouseUp={handleTerminalMouseUp}
              />
            </FloorPlanViewer>
          </div>

          {/* Device Palette (Right) - Collapsible */}
          <div className={`relative h-full bg-white z-10 shadow-lg border-l border-slate-200 transition-all duration-300 ease-in-out ${isPaletteOpen ? 'w-64' : 'w-0'}`}>
            {/* Toggle Button */}
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className={`absolute top-1/2 bg-white border border-slate-200 rounded-l-md shadow-md flex items-center justify-center text-slate-500 hover:text-slate-800 focus:outline-none z-20 transition-all duration-300 ${isPaletteOpen ? 'w-6 -left-6 h-12' : 'w-10 -left-10 h-16'}`}
              title={isPaletteOpen ? "Collapse Palette" : "Expand Palette"}
            >
              {isPaletteOpen ? <ChevronRight size={14} /> : <ChevronLeft size={20} />}
            </button>

            <div className="h-full overflow-hidden">
              <DevicePalette />
            </div>
          </div>

          <GenerationModal
            isOpen={isGeneratorOpen}
            onClose={() => setIsGeneratorOpen(false)}
            onGenerate={handleGeneratePlan}
          />
        </div>

        {/* Drag Overlay for ghost */}
        <DragOverlay>
          {activeDragType ? (
            <div style={{ width: 32, height: 32 }}>
              <DeviceNode typeId={activeDragType} rotation={0} />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App;
