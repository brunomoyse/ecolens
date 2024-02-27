import {useMap} from "@/context/map-context";
import { useAppSelector } from "@/store/hooks";
import { Search } from "lucide-react";
import {useDraggable} from "@/lib/utils";
import { Input } from "@/components/ui/input"
import {Label} from "@/components/ui/label";
import {useEffect} from "react";


export default function CircleInfoCard() {
    useDraggable('circle-info-card', 'drag-circle-info-card');

    const drawnCircle = useAppSelector((state) => state.drawing.drawnCircle);
    if (!drawnCircle) return;

    return (
        <aside id="circle-info-card" className="absolute z-20 right-24 top-12 bg-gray-200 rounded-3xl shadow-lg overflow-hidden">
            <header id="drag-circle-info-card" className="flex cursor-move justify-between py-4 px-6 bg-gray-300 rounded-t-3xl">
                <div className="flex">
                    <Search className="h-6 w-6 mr-3"/>
                    <h2 className="text-xl font-bold text-center pl-1 mr-4 select-none">Recherche</h2>
                </div>
            </header>
            <div className="p-6">
                <Label htmlFor="text">Rayon de recherche (km)</Label>
                <Input type="number" value={(drawnCircle.getRadius()/1000).toFixed(2)} />
                <ul className="list-disc space-y-2">
                    <li>1</li>
                    <li>2</li>
                </ul>
            </div>
        </aside>
    );
}
