import {useMap} from "@/context/map-context";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import { Search } from "lucide-react";
import {createCircleWkt, useDraggable} from "@/lib/utils";
import { Input } from "@/components/ui/input"
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {setDrawnCircleRadius} from "@/store/slices/drawingSlice";
import {fetchCircleSearchResults} from "@/store/slices/enterpriseSlice";
import {Circle, Geometry} from "ol/geom";
import {Feature} from "ol";
import {convertArrayToCSV, downloadCSV} from "@/lib/utils";

export default function CircleInfoCard() {
    useDraggable('circle-info-card', 'drag-circle-info-card');
    const dispatch = useAppDispatch();

    const circleSearchResults = useAppSelector((state) => state.enterprise.circleSearchResults);
    const drawnCircleCenter = useAppSelector((state) => state.drawing.drawnCircleCenter);
    const drawnCircleRadius = useAppSelector((state) => state.drawing.drawnCircleRadius);
    if (!(drawnCircleRadius && drawnCircleCenter)) return;

    // Handle radius change
    const handleRadiusChange = (event: any) => {
        // Convert input value to a number and dispatch the action
        const newRadius = Number(event.target.value);
        dispatch(setDrawnCircleRadius(newRadius));

        // Create a Feature<Geometry> and add the Circle in it
        const feature = new Feature<Geometry>(new Circle(drawnCircleCenter, newRadius));
        const wktString = createCircleWkt(feature);

        dispatch(fetchCircleSearchResults({wkt: wktString}));
    };

    const handleExportButtonClick = () => {
        if (!circleSearchResults) return;
        // Export enterprises
        const enterprisesCSV = convertArrayToCSV(circleSearchResults.enterprises.map(({ __typename, ...rest }) => rest));
        downloadCSV(enterprisesCSV, '1_zone_entreprises.csv');

        // Export eaps
        const eapsCSV = convertArrayToCSV(circleSearchResults.eaps.map(({ __typename, ...rest }) => rest));
        downloadCSV(eapsCSV, '2_zone_pae.csv');

        // Export plots
        const plotsCSV = convertArrayToCSV(circleSearchResults.plots.map(({ __typename, ...rest }) => rest));
        downloadCSV(plotsCSV, '3_zone_parcelles.csv');
    }


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
                    <Input type="number" className="w-1/3" value={drawnCircleRadius} onChange={handleRadiusChange} />
                </div>

                <ul className="list-disc space-y-2">
                    <li><strong>PAE:</strong> {circleSearchResults && circleSearchResults.eaps ? circleSearchResults.eaps.length : 0 }</li>
                    <li><strong>Entreprises: </strong> {circleSearchResults && circleSearchResults.enterprises ? circleSearchResults.enterprises.length : 0 }</li>
                    <li><strong>Emplois:</strong> à calculer</li>
                    <li><strong>Parcelles:</strong> {circleSearchResults && circleSearchResults.plots ? circleSearchResults.plots.length : 0 }</li>
                    <li><strong>Parcelles inoccupées:</strong> à calculer</li>
                </ul>

                <Button size="sm" className="w-full mt-4 uppercase" onClick={handleExportButtonClick}>Exporter détail</Button>

            </div>
        </aside>
    );
}
