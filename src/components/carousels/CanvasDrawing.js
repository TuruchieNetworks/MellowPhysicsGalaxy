import React from "react";
import { use2DPencil } from "./use2DPencil";

export default function CanvasDrawing() {
    const {
        canvasRef,
        coordinates,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleClearCanvas
    } = use2DPencil();

    return (
        <div>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                    border: "1px solid black",
                    width: "500px",
                    height: "500px",
                    cursor: "crosshair"
                }}
            ></canvas>
            <div style={{ marginTop: "10px" }}>
                <button onClick={handleClearCanvas}>Clear</button>
                <p>Coordinates: {JSON.stringify(coordinates)}</p>
            </div>
        </div>
    );
}