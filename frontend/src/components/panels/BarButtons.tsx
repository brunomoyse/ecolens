import {Button} from "@/components/ui/button";
import {Ruler, List} from "lucide-react";

interface BottomButtonsProps {
    onToggleBottomPanel: () => void;
}

export default function BarButtons({ onToggleBottomPanel }: BottomButtonsProps) {
    return (
        <div className="flex flex-col absolute top-1/2 right-0 z-50 -translate-x-1/2 buttons-bar">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mb-4">
                <Ruler className="h-6 w-6" />
            </Button>
            <Button onClick={onToggleBottomPanel} variant="outline" size="icon" className="h-12 w-12 rounded-full border-2 border-red-600 mb-4">
                <List className="h-6 w-6" />
            </Button>
        </div>
    );
}
