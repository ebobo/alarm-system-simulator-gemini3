import React from 'react';
import { Map, Layers, Trash2, Wand2 } from 'lucide-react';

export interface Plan {
    id: string;
    name: string;
    imageUrl: string;
    isCustom?: boolean;
}

interface PlanSelectorProps {
    plans: Plan[];
    activePlanId: string;
    onSelectPlan: (id: string) => void;
    onFileUpload: (file: File) => void;
    onDeletePlan: (id: string) => void;
    onGenerateRandom: () => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
    plans,
    activePlanId,
    onSelectPlan,
    onFileUpload,
    onDeletePlan,
    onGenerateRandom,
}) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div className="absolute top-4 left-4 z-20 w-64 bg-white/95 backdrop-blur shadow-lg rounded-xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Map size={16} className="text-blue-600" />
                    Floor Plans
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={onGenerateRandom}
                        className="p-1.5 rounded-md text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                        title="Generate Random Plan"
                    >
                        <Wand2 size={16} />
                    </button>
                    <label className="cursor-pointer text-xs bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1.5 rounded-md text-slate-600 font-medium transition-colors flex items-center">
                        Upload
                        <input
                            type="file"
                            accept="image/*,image/svg+xml"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>

            <div className="p-2 flex flex-col gap-1 overflow-y-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => onSelectPlan(plan.id)}
                        className={`
              w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer group
              ${activePlanId === plan.id
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}
            `}
                    >
                        <div className={`p-2 rounded-md ${activePlanId === plan.id ? 'bg-blue-100' : 'bg-slate-100'}`}>
                            <Layers size={16} />
                        </div>
                        <span className="text-sm font-medium flex-1 truncate">{plan.name}</span>
                        {plan.isCustom && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePlan(plan.id);
                                }}
                                className="p-1.5 rounded-md hover:bg-red-100 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete Plan"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
