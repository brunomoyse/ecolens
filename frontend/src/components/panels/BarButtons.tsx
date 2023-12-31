import {Button} from "@/components/ui/button";
import {Layers, Ruler, List, Printer, MoreHorizontal} from "lucide-react";
interface BottomButtonsProps {
    onToggleLeftPanel: () => void;
}

export default function BarButtons({ onToggleLeftPanel }: BottomButtonsProps) {
    return (
        <div className="absolute bottom-14 left-1/2 z-10 -translate-x-1/2">
            <Button onClick={onToggleLeftPanel} variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mr-4">
                <Layers className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mr-4">
                <Ruler className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mr-4">
                <List className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mr-4">
                <Printer className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600">
                <MoreHorizontal className="h-6 w-6" />
            </Button>
        </div>
    );
}
