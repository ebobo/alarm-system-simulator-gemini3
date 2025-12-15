import { useState } from 'react';
import { FloorPlanViewer } from './components/FloorPlanViewer';
import { PlanSelector } from './components/PlanSelector';
import type { Plan } from './components/PlanSelector';
import { generateFloorPlanSVG, type GeneratorConfig } from './utils/floorPlanGenerator';
import { GenerationModal } from './components/GenerationModal';


// Sample data
// Generate a high-quality default plan on load
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

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0];

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

    // Provide a summary name
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
      // Fallback to the first available plan (or the first default one) if we deleted the active one
      // We calculate this based on the *next* state concept, but since state update is async, 
      // we can safely pick DEFAULT_PLANS[0].id or logic to pick the previous one.
      // Simple safe fallback:
      setActivePlanId(DEFAULT_PLANS[0].id);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900">
      {/* Header / Nav could go here */}

      <div className="flex-1 relative overflow-hidden">
        {/* Sidebar Controls */}
        <PlanSelector
          plans={plans}
          activePlanId={activePlanId}
          onSelectPlan={setActivePlanId}
          onFileUpload={handleFileUpload}
          onDeletePlan={handleDeletePlan}
          onGenerateRandom={() => setIsGeneratorOpen(true)}
        />

        {/* Main Viewer Area */}
        <FloorPlanViewer
          key={activePlanId} // Re-mount on plan change to reset zoom
          imageUrl={activePlan.imageUrl}
        >
          {/* Future overlays can be passed here as children */}
        </FloorPlanViewer>

        <GenerationModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          onGenerate={handleGeneratePlan}
        />
      </div>
    </div>
  );
}

export default App;
