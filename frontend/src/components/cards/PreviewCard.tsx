// Popup.tsx
import React from 'react';
import {enterpriseDetails} from "@/types";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button";
import {BookOpen} from "lucide-react";


interface PreviewCardMapProps {
    data: enterpriseDetails;
    coordinate: [number, number] | undefined;
}

const PreviewCardMap: React.FC<PreviewCardMapProps> = ({ data, coordinate }) => {
    if (!data || !coordinate) return null;

    // Inline style for positioning
    const positionStyle = {
        left: `${coordinate[0]}px`,
        top: `${coordinate[1]}px`,
    };

    return (
        /*
        <div style={positionStyle} className="absolute z-10 p-4 bg-white shadow-lg rounded-lg">
            <h3 className="font-bold text-lg">{data.denomination}</h3>
            <p className="text-sm">N° entreprise: {data.enterprise_number}</p>
            <p className="text-sm">Unité d&#39;établissement: {data.establishment_number}</p>
        </div>

        */
        <div style={positionStyle} className="absolute z-10 p-4">
            <Card>
                <CardHeader>
                    <CardTitle>{data.denomination}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>N° entreprise: {data.enterprise_number}</p>
                    <p>Unité d&#39;établissement: {data.establishment_number}</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" /> Détails
                    </Button>
                </CardFooter>
            </Card>
        </div>

    );
};

export default PreviewCardMap;
