import React, { useState } from 'react';
import { X, Wand2 } from 'lucide-react';
import type { GeneratorConfig } from '../utils/floorPlanGenerator';

interface GenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (config: GeneratorConfig) => void;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [config, setConfig] = useState<GeneratorConfig>({
        offices: 6,
        meetingRooms: 2,
        toilets: 3
    });

    if (!isOpen) return null;

    const handleConfirm = () => {
        onGenerate(config);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Wand2 size={18} className="text-purple-600" />
                        Generate Floor Plan
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500 mb-4">
                        Specify requirements. A <b>Public Area</b> with an emergency exit will be automatically included.
                    </p>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Offices (Max 9)</label>
                        <input
                            type="number" min="0" max="9"
                            value={config.offices}
                            onChange={e => setConfig({ ...config, offices: Math.min(9, parseInt(e.target.value) || 0) })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Meeting Rooms (Max 2)</label>
                        <input
                            type="number" min="0" max="2"
                            value={config.meetingRooms}
                            onChange={e => setConfig({ ...config, meetingRooms: Math.min(2, parseInt(e.target.value) || 0) })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Toilets (Max 3)</label>
                        <input
                            type="number" min="0" max="3"
                            value={config.toilets}
                            onChange={e => setConfig({ ...config, toilets: Math.min(3, parseInt(e.target.value) || 0) })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Wand2 size={16} />
                        Generate
                    </button>
                </div>
            </div>
        </div>
    );
};
