// Utility functions for converting between Screen Space and Plan Space

export interface TransformState {
    scale: number;
    positionX: number;
    positionY: number;
}

export interface Coordinates {
    x: number;
    y: number;
}

/**
 * Converts screen coordinates (e.g. mouse event clientX/Y) to the local coordinate space of the plan.
 * This accounts for the Zoom/Pan transformation.
 */
export const screenToPlanCoordinates = (
    screenX: number,
    screenY: number,
    transform: TransformState,
    containerRect: DOMRect
): Coordinates => {
    // 1. Normalize screen coordinates relative to the container
    const localX = screenX - containerRect.left;
    const localY = screenY - containerRect.top;

    // 2. Apply the inverse transform: (value - translate) / scale
    const planX = (localX - transform.positionX) / transform.scale;
    const planY = (localY - transform.positionY) / transform.scale;

    return { x: planX, y: planY };
};

/**
 * Converts plan coordinates back to screen coordinates (e.g. for tooltips).
 */
export const planToScreenCoordinates = (
    planX: number,
    planY: number,
    transform: TransformState,
    containerRect: DOMRect
): Coordinates => {
    const localX = (planX * transform.scale) + transform.positionX;
    const localY = (planY * transform.scale) + transform.positionY;

    return {
        x: localX + containerRect.left,
        y: localY + containerRect.top
    };
};
