import { Stage, Layer, Line } from "react-konva";

export default function KonvaDrawing() {
    const [lines, setLines] = React.useState([]);

    const handleMouseDown = () => {
        setLines([...lines, []]);
    };

    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        let lastLine = lines[lines.length - 1];
        lastLine = lastLine.concat([point.x, point.y]);
        setLines([...lines.slice(0, -1), lastLine]);
    };

    return (
        <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
        >
            <Layer>
                {lines.map((line, index) => (
                    <Line key={index} points={line} stroke="black" />
                ))}
            </Layer>
        </Stage>
    );
}
