import {Button} from "@/components/ui/button";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {setDrawingState, setDrawnFeature} from "@/store/slices/drawingSlice";
import {Eraser, Pencil, Download} from "lucide-react";
import {useMap} from "@/context/map-context";
import { Parser } from 'json2csv';
import {ReloadIcon} from "@radix-ui/react-icons";
import {useState} from "react";

export default function BarButtons() {
    const { map } = useMap();

    const enteprises = useAppSelector((state) => state.enterprise.enterprises);
    const drawingState = useAppSelector((state) => state.drawing);
    const dispatch = useAppDispatch();

    // Exporting state
    const [isExporting, setIsExporting] = useState(false);

    const handleSetDrawing = () => {
        dispatch(setDrawingState(true));
    };

    const handleClearDraw = () => {
        dispatch(setDrawingState(false));
        dispatch(setDrawnFeature(null));
        map?.getLayers().forEach((layer) => {
            if (layer.get('title') === 'Drawing') {
                map.removeLayer(layer);
            }
        });
    }

    const handleExport = async () => {
        if (!enteprises || enteprises.length === 0) return;
        setIsExporting(true);

        try {
            const parser = new Parser();
            // @ts-ignore
            const enterprisesCopy = [...enteprises].map(({ __typename, id, ...rest }) => rest);

            const csv = parser.parse(enterprisesCopy);

            // Get the current date and time and format it as dd-mm-yy_hh-mm
            const now = new Date();
            const fileNameDatePart = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getFullYear()).slice(-2)}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `export_entreprises_${fileNameDatePart}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsExporting(false);
        } catch (err) {
            console.error('Error exporting to CSV:', err);
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col absolute top-1/4 right-0 z-50 -translate-x-1/2 buttons-bar">
            {!drawingState.drawnFeature && (
            <Button onClick={handleSetDrawing} variant="outline" size="icon" className={`h-12 w-12 rounded-full border-2 border-red-600 mb-4 ${drawingState.isDrawing ? 'bg-gray-300' : ''}`}>
                <Pencil className="h-6 w-6" />
            </Button>
            )}
            {(drawingState.drawnFeature) && (
                <Button onClick={handleClearDraw} variant="outline" size="icon" className={`h-12 w-12 rounded-full border-2 border-gray-600 mb-4 bg-gray-300`}>
                    <Eraser className="h-6 w-6" />
                </Button>
            )}
            <Button onClick={handleExport} variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mb-4">
                {isExporting ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : <Download className="h-6 w-6" />}
            </Button>
        </div>
    );
}
