'use client';

import { Cell, ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import * as React from 'react';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { EconomicalActivityPark, NaceCode as NaceType } from '@/types';
import { fetchNaceCodes } from '@/store/slices/naceCodeSlice';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Filter, ZoomIn } from 'lucide-react';
import { useMap } from '@/context/map-context';
import { fromLonLat } from 'ol/proj';
import { setFilterSector, setFilterEntityType, setFilterEap, setFilterNace } from '@/store/slices/enterpriseSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { fetchEaps } from '@/store/slices/eapSlice';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

const displayFilter = (header: any) => {
	return header === "Type d'entité" || header === 'Secteur' || header === 'NACE' || header === 'PRE';
};

const getTranslationSector = (cell: Cell<any, any>) => {
	const cellValue = cell.getValue();
	if (cellValue === 'PRIMARY') {
		return 'Primaire';
	} else if (cellValue === 'SECONDARY') {
		return 'Secondaire';
	} else if (cellValue === 'TERTIARY') {
		return 'Tertiaire';
	} else return flexRender(cell.column.columnDef.cell, cell.getContext());
};

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
		zoom: 20,
		duration: 1000,
	});
};

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const { map } = useMap();
	const naceCodes = useAppSelector((state) => state.naceCode.naceCodes);
	const economicalActivityParks = useAppSelector((state) => state.eap.economicalActivityParks);

	const filterSector = useAppSelector((state) => state.enterprise.filterSector);
	const filterEap = useAppSelector((state) => state.enterprise.filterEap);
	const filterNace = useAppSelector((state) => state.enterprise.filterNace);
	const filterEntityType = useAppSelector((state) => state.enterprise.filterEntityType);

	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!map) return;
		dispatch(fetchNaceCodes());
		dispatch(fetchEaps());
	}, [map]); /* eslint-disable-line */

	const getFilterContent = (header: any) => {
		if (header === "Type d'entité") {
			return (
				<RadioGroup defaultValue="all" onValueChange={handleEntityChange}>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="all" id="r1" />
						<Label htmlFor="r1">Tous</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="Personne physique" id="r2" />
						<Label htmlFor="r2">Personne physique</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="Personne morale" id="r3" />
						<Label htmlFor="r3">Personne morale</Label>
					</div>
				</RadioGroup>
			);
		} else if (header === 'Secteur') {
			return (
				<RadioGroup defaultValue={filterSector ?? 'all'} onValueChange={handleSectorChange}>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="all" id="r1" />
						<Label htmlFor="r1">Tous</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="PRIMARY" id="r2" />
						<Label htmlFor="r2">Primaire</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="SECONDARY" id="r3" />
						<Label htmlFor="r3">Secondaire</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="TERTIARY" id="r3" />
						<Label htmlFor="r3">Tertiaire</Label>
					</div>
				</RadioGroup>
			);
		} else if (header === 'NACE') {
			return (
				<Select defaultValue={filterNace ?? undefined} onValueChange={handleNaceChange}>
					<SelectTrigger>
						<SelectValue placeholder="Sélectionner une section" />
					</SelectTrigger>
					<SelectContent className="max-w-96">
						<SelectGroup>
							<SelectLabel>Sections</SelectLabel>
							{naceCodes.map((nace: NaceType) => (
								<SelectItem key={nace.code} value={nace.code}>
									{nace.description}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			);
		} else if (header === 'PRE') {
			return (
				<Select defaultValue={filterEap ?? undefined} onValueChange={handleEapChange}>
					<SelectTrigger>
						<SelectValue placeholder="Sélectionner un PRE" />
					</SelectTrigger>
					<SelectContent className="max-w-96">
						<SelectGroup>
							<SelectLabel>Codes Carto</SelectLabel>
							{economicalActivityParks.map((eap: EconomicalActivityPark) => (
								<SelectItem key={eap.id} value={eap.id}>
									{eap.codeCarto}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			);
		} else return '';
	};

	const getFilterIconStatus = (header: any): boolean => {
		if (header === "Type d'entité") {
			return !!filterEntityType;
		} else if (header === 'Secteur') {
			return !!filterSector;
		} else if (header === 'NACE') {
			return !!filterNace;
		} else if (header === 'PRE') {
			return !!filterEap;
		} else return false;
	};

	const handleEntityChange = (value: string) => {
		if (value === 'all') {
			dispatch(setFilterEntityType(null));
			return;
		}
		dispatch(setFilterEntityType(value));
	};

	const handleSectorChange = (value: string) => {
		if (value === 'all') {
			dispatch(setFilterSector(null));
			return;
		}

		dispatch(setFilterSector(value));
	};

	const handleNaceChange = (value: string) => {
		dispatch(setFilterNace(value));
	};

	const handleEapChange = (value: string) => {
		dispatch(setFilterEap(value));
	};

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

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
											{displayFilter(header.column.columnDef.header!) ? (
												<Popover>
													<PopoverTrigger>
														<Filter
															className="h-5 w-5 mr-2"
															fill={
																getFilterIconStatus(header.column.columnDef.header)
																	? 'black'
																	: 'white'
															}
														/>
													</PopoverTrigger>
													<PopoverContent side="top">
														{getFilterContent(header.column.columnDef.header)}
													</PopoverContent>
												</Popover>
											) : null}
											{/* Column header */}
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</div>
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className="border-red-600">
										{getTranslationSector(cell)}
										{cell.getContext()?.column.id === 'actions' ? (
											<div className="flex justify-center">
												<button
													className="p-2 bg-gray-200 rounded-full"
													onClick={() => zoomToFeatureOnClick(map, row.original)}
												>
													<ZoomIn />
												</button>
											</div>
										) : null}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								Aucune donnée disponible.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
