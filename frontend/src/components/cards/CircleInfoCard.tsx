import {useMap} from "@/context/map-context";
import { useAppSelector } from "@/store/hooks";
import { Search } from "lucide-react";
import {useDraggable} from "@/lib/utils";
import { Input } from "@/components/ui/input"
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";


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
            <div className="px-6 pb-6 pt-2">
                <div className="flex pb-2">
                    <div className="flex items-center w-2/3">
                        <Label htmlFor="text" className="">Rayon de recherche (mètres)</Label>
                    </div>
                    <Input type="number" className="w-1/3" value={(drawnCircle.getRadius()).toFixed(0)} />
                </div>

                <ul className="list-disc space-y-2">
                    <li><strong>PAE:</strong> 1</li>
                    <li><strong>Entreprises:</strong> 1</li>
                    <li><strong>Emplois:</strong> 1</li>
                    <li><strong>Parcelles:</strong> 1</li>
                    <li><strong>Parcelles inoccupées:</strong> 1</li>
                </ul>

                <Button size="sm" className="w-full mt-4 uppercase">Exporter détail</Button>

            </div>
        </aside>
    );
}
