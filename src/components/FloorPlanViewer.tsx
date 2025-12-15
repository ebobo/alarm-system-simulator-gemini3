import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface FloorPlanViewerProps {
    imageUrl?: string;
    initialScale?: number;
    children?: React.ReactNode;
}

export const FloorPlanViewer = forwardRef<ReactZoomPanPinchRef, FloorPlanViewerProps>(({
    imageUrl,
    initialScale = 1,
    children
}, ref) => {
    // Internal state for scale (just for UI update)
    const [currentScale, setCurrentScale] = React.useState(initialScale);

    // Drop zone
    const { setNodeRef } = useDroppable({
        id: 'floor-plan-droppable',
    });

    const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);

    useImperativeHandle(ref, () => transformComponentRef.current!, []);

    return (
        <div className="relative w-full h-full bg-slate-50 overflow-hidden">
            {/* Floating Controls */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 bg-white/90 p-2 rounded-lg shadow-md backdrop-blur-sm border border-slate-200">
                <button
                    onClick={() => transformComponentRef.current?.zoomIn()}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700"
                    title="Zoom In"
                >
                    <ZoomIn size={20} />
                </button>
                <button
                    onClick={() => transformComponentRef.current?.zoomOut()}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700"
                    title="Zoom Out"
                >
                    <ZoomOut size={20} />
                </button>
                <div className="h-px bg-slate-200 my-1" />
                <button
                    onClick={() => transformComponentRef.current?.resetTransform()}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700"
                    title="Reset View"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            <TransformWrapper
                ref={transformComponentRef}
                initialScale={initialScale}
                minScale={0.1}
                maxScale={20}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                onTransformed={(e) => setCurrentScale(e.state.scale)}
                onInit={(e) => setCurrentScale(e.state.scale)}
            >
                {() => (
                    <>
                        {/* Hub/Overlay for zoom level */}
                        <div className="absolute bottom-4 right-4 z-20 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none">
                            {Math.round(currentScale * 100)}%
                        </div>

                        <TransformComponent
                            wrapperClass="!w-full !h-full"
                            contentClass="!w-full !h-full flex items-center justify-center p-20"
                        >
                            {/* The Container for the Plan */}
                            <div
                                id="floor-plan-content"
                                ref={setNodeRef}
                                className="relative shadow-2xl bg-white"
                            >
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt="Floor Plan"
                                        className="block max-w-none pointer-events-none select-none"
                                        draggable={false}
                                    />
                                )}
                                {/* Overlay / Children (Devices) go here, inside the transform context */}
                                {children}
                            </div>
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
});

FloorPlanViewer.displayName = 'FloorPlanViewer';
