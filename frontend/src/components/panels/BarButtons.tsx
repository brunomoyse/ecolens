import {Button} from "@/components/ui/button";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {toggleDrawing, toggleDrawn} from "@/store/slices/drawingSlice";
import {Eraser, Pencil, Download} from "lucide-react";
import {useMap} from "@/context/map-context";

export default function BarButtons() {
    const { map } = useMap();

    const drawingState = useAppSelector((state) => state.drawing);
    const dispatch = useAppDispatch();

    const handleToggleDrawing = () => {
        dispatch(toggleDrawing());
    };

    const handleClearDraw = () => {
        dispatch(toggleDrawn());
        map?.getLayers().forEach((layer) => {
            if (layer.get('title') === 'Drawing') {
                map.removeLayer(layer);
            }
        });
    }

    return (
        <div className="flex flex-col absolute top-1/4 right-0 z-50 -translate-x-1/2 buttons-bar">
            {!drawingState.isDrawn && (
            <Button onClick={handleToggleDrawing} variant="outline" size="icon" className={`h-12 w-12 rounded-full border-2 border-red-600 mb-4 ${drawingState.isDrawing ? 'bg-gray-300' : ''}`}>
                <Pencil className="h-6 w-6" />
            </Button>
            )}
            {drawingState.isDrawn && (
                <Button onClick={handleClearDraw} variant="outline" size="icon" className={`h-12 w-12 rounded-full border-2 border-gray-600 mb-4 bg-gray-300`}>
                    <Eraser className="h-6 w-6" />
                </Button>
            )}
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mb-4">
                <Download className="h-6 w-6" />
            </Button>
        </div>
    );
}
