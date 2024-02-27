"use client"

import {
    Cell,
    ColumnDef, ColumnDefTemplate,
    flexRender,
    getCoreRowModel, HeaderContext,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

import {Filter, ZoomIn} from "lucide-react";
import {Enterprise} from "@/types";
import {Extent} from "ol/extent";
import {useMap} from "@/context/map-context";
import {Geometry} from "ol/geom";
import {Feature} from "ol";
import Map from "ol/Map";
import {fromLonLat} from "ol/proj";

interface ZoomToFeatureProps {
    map: Map | null;
    latitude: number;
    longitude: number;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

const displayFilter = (header: any) => {
    return header === "Type d'entité" || header === "Secteur" || header === "NACE" || header === "PAE";
}

const getFilterContent = (header: any) => {
    if (header === "Type d'entité") {
        return (
            <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="r1"/>
                    <Label htmlFor="r1">Tous</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Personne physique" id="r2"/>
                    <Label htmlFor="r2">Personne physique</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Personne morale" id="r3"/>
                    <Label htmlFor="r3">Personne morale</Label>
                </div>
            </RadioGroup>
        )
    } else if (header === 'Secteur') {
        return (
            <RadioGroup defaultValue="all">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="r1"/>
                    <Label htmlFor="r1">Tous</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PRIMARY" id="r2"/>
                    <Label htmlFor="r2">Primaire</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SECONDARY" id="r3"/>
                    <Label htmlFor="r3">Secondaire</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TERTIARY" id="r3"/>
                    <Label htmlFor="r3">Tertiaire</Label>
                </div>
            </RadioGroup>
        )
    } else if (header === 'NACE') {
        return (
            <div>
                <Label htmlFor="nace" className="text-sm">Rechercher un NACE</Label>
                <input placeholder="1234" type="number" id="nace" className="w-full rounded-md border border-gray-300 px-2 py-1"/>
            </div>
        )
    } else if (header === 'PAE') {
        return (
            <div>
                <Label htmlFor="eap" className="text-sm">Rechercher un PAE</Label>
                <input placeholder="Martinroux" type="text" id="eap" className="w-full rounded-md border border-gray-300 px-2 py-1"/>
            </div>
        )
    } else return '';
}

const getTranslationSector = (cell: Cell<any, any>) => {
    const cellValue = cell.getValue();
    if (cellValue === 'PRIMARY') {
        return 'Primaire';
    } else if (cellValue === 'SECONDARY') {
        return 'Secondaire';
    } else if (cellValue === 'TERTIARY') {
        return 'Tertiaire';
    } else return flexRender(cell.column.columnDef.cell, cell.getContext());
}

const zoomToFeatureOnClick = (map: any, record: any) => {
    if (!map || !record || !record.coordinates) return;

    // Extract the latitude and longitude from the record
    const { latitude, longitude } = record.coordinates;

    // Ensure the coordinates are numbers before proceeding
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.error('Invalid coordinates');
        return;
    }

    // Convert the feature's WGS84 coordinates to the map's projection (EPSG:3857)
    const featureCoordinates = fromLonLat([longitude, latitude]);

    // Setting the view to the feature's coordinates with some options
    map.getView().animate({
        center: featureCoordinates,
        zoom: 21,
        duration: 1000
    });
};

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                         }: DataTableProps<TData, TValue>) {
    const { map } = useMap();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (!map) return null;

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        <div className="flex">
                                            {/* Filter */}
                                            {displayFilter(header.column.columnDef.header!) ?
                                                <Popover>
                                                    <PopoverTrigger>
                                                        <Filter className="h-5 w-5 mr-2" />
                                                    </PopoverTrigger>
                                                    <PopoverContent side="top">
                                                        { getFilterContent(header.column.columnDef.header) }
                                                    </PopoverContent>
                                                </Popover>
                                                : null}
                                            {/* Column header */}
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </div>
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="border-red-600">
                                        { getTranslationSector(cell) }
                                        {cell.getContext()?.column.id === 'actions' ?
                                            <div className="flex justify-center">
                                                <button
                                                    className="p-2 bg-gray-200 rounded-full"
                                                    onClick={() => zoomToFeatureOnClick(map, row.original)}
                                                >
                                                    <ZoomIn />
                                                </button>
                                            </div> : null
                                        }
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Erreur lors du chargement des données.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
