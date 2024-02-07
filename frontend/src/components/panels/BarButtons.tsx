import {Button} from "@/components/ui/button";
import {Ruler, List, DeleteIcon} from "lucide-react";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {toggleDrawing, toggleDrawn} from "@/store/slices/drawingSlice";
import {ResetIcon} from "@radix-ui/react-icons";
import {useMap} from "@/context/map-context";

interface BottomButtonsProps {
    onToggleBottomPanel: () => void;
}

export default function BarButtons({ onToggleBottomPanel }: BottomButtonsProps) {
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
        <div className="flex flex-col absolute top-1/2 right-0 z-50 -translate-x-1/2 buttons-bar">
            {!drawingState.isDrawn && (
            <Button onClick={handleToggleDrawing} variant="outline" size="icon" className={`h-12 w-12 rounded-full border-2 border-red-600 mb-4 ${drawingState.isDrawing ? 'bg-gray-300' : ''}`}>
                <Ruler className="h-6 w-6" />
            </Button>
            )}
            {drawingState.isDrawn && (
                <Button onClick={handleClearDraw} variant="outline" size="icon" className={`h-12 w-12 rounded-full border-2 border-gray-600 mb-4 bg-gray-300`}>
                    <ResetIcon className="h-6 w-6" />
                </Button>
            )}

            <Button onClick={onToggleBottomPanel} variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mb-4">
                <List className="h-6 w-6" />
            </Button>
        </div>
    );
}
