import { useState, useRef } from 'react';
import { FloorPlanViewer } from './components/FloorPlanViewer';
import { PlanSelector } from './components/PlanSelector';
import type { Plan } from './components/PlanSelector';
import { generateFloorPlanSVG, type GeneratorConfig } from './utils/floorPlanGenerator';
import { GenerationModal } from './components/GenerationModal';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, type DragEndEvent } from '@dnd-kit/core';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { DevicePalette } from './components/DevicePalette';
import { DeviceOverlay } from './components/DeviceOverlay';
import type { PlacedDevice, DeviceTypeId } from './types/device';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0];
  const floorPlanRef = useRef<ReactZoomPanPinchRef>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;

    if (!over || over.id !== 'floor-plan-droppable') return;

    // Coordinate calculation
    // We need the drop position relative to the viewport
    // event.activatorEvent is the pointer event (usually)
    // But dnd-kit provides coordinates in `event.delta` relative to start, or we can use the pointer position if we track it?
    // dnd-kit doesn't expose absolute pointer coordinates in DragEndEvent directly easily without modifiers.
    // However, we can calculate it from the droppable rect? 
    // Actually, `active.rect` might help, but we want the cursor position or the center of the item?
    // Let's assume we want the center of the dropped item.

    // Better approach: Use the client coordinates of the drop.
    // We can get them from the sensor event or by adding delta to initial.
    // But simplest is:
    // `event.active.rect.current.translated` gives the simplified rect on screen.

    const dropRect = event.active.rect.current.translated;
    if (!dropRect) return;

    const dropX = dropRect.left + dropRect.width / 2;
    const dropY = dropRect.top + dropRect.height / 2;

    // Now convert screen (dropX, dropY) to plan coordinates.
    // 1. Get Transform State
    const transformState = floorPlanRef.current?.instance.transformState;

    // 2. Get the actual content bounding rect (which includes scale/pan/padding)
    const contentNode = document.getElementById('floor-plan-content');

    if (transformState && contentNode) {
      const contentRect = contentNode.getBoundingClientRect();
      const scale = transformState.scale;

      // Calculate position relative to the content's top-left, then unscale
      const planX = (dropX - contentRect.left) / scale;
      const planY = (dropY - contentRect.top) / scale;

      const newDevice: PlacedDevice = {
        id: `dev-${Date.now()}`,
        typeId: active.data.current?.typeId || 'autroguard-base',
        x: planX,
        y: planY,
        rotation: 0
      };

      setPlacedDevices(prev => [...prev, newDevice]);
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
              <DeviceOverlay devices={placedDevices} />
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
            <div className="w-10 h-10 bg-slate-100/80 rounded-full border-2 border-slate-700 shadow-xl flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border border-slate-400 bg-white" />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App;
