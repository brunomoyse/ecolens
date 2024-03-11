import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
	setDrawingCircleState,
	setDrawingPolygonState,
	setDrawnCircleCenter,
	setDrawnCircleRadius,
	setDrawnFeature,
} from '@/store/slices/drawingSlice';
import { Eraser, Pencil, Download, CircleDotDashed } from 'lucide-react';
import { useMap } from '@/context/map-context';
import { Parser } from 'json2csv';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import apolloClient from '@/lib/apollo-client';
import gql from 'graphql-tag';
import { transformExtent } from 'ol/proj';

export default function BarButtons() {
	const { map } = useMap();

	const drawingState = useAppSelector((state) => state.drawing);
	const dispatch = useAppDispatch();
	const filterSector = useAppSelector((state) => state.enterprise.filterSector);
	const filterEap = useAppSelector((state) => state.enterprise.filterEap);
	const filterNace = useAppSelector((state) => state.enterprise.filterNace);
	const filterEntityType = useAppSelector((state) => state.enterprise.filterEntityType);
	const drawnFeature = useAppSelector((state) => state.drawing.drawnFeature);

	// Exporting state
	const [isExporting, setIsExporting] = useState(false);

	const handleSetDrawingPolygon = () => {
		dispatch(setDrawingPolygonState(true));
	};
	const handleSetDrawingCircle = () => {
		dispatch(setDrawingCircleState(true));
	};

	const handleClearDraw = () => {
		dispatch(setDrawingPolygonState(false));
		dispatch(setDrawingCircleState(false));
		dispatch(setDrawnFeature(null));
		dispatch(setDrawnCircleRadius(null));
		dispatch(setDrawnCircleCenter(null));
		map?.getLayers().forEach((layer) => {
			if (layer.get('title') === 'Drawing') {
				map.removeLayer(layer);
			}
		});
	};

	const handleExport = async () => {
		if (!map) return;
		setIsExporting(true);

		let queryVariables: any = {
			page: 1,
			pageSize: 43800,
			filterEap: filterEap || null,
			filterNace: filterNace || null,
			filterEntityType: filterEntityType || null,
			filterSector: filterSector || null,
		};

		if (drawnFeature) {
			queryVariables = {
				...queryVariables,
				wkt: drawnFeature,
			};
		} else {
			const currentBbox3857 = map.getView().calculateExtent(map.getSize());
			const bboxWGS84 = transformExtent(currentBbox3857, 'EPSG:3857', 'EPSG:4326');

			queryVariables = {
				...queryVariables,
				bbox: bboxWGS84,
			};
		}

		const response = await apolloClient.query({
			query: gql`
				query (
					$pageSize: Int
					$page: Int
					$bbox: [Float!]
					$wkt: String
					$filterEap: UUID
					$filterEntityType: String
					$filterSector: SectorEnum
					$filterNace: String
				) {
					enterprises(
						pageSize: $pageSize
						page: $page
						bbox: $bbox
						wkt: $wkt
						eapId: $filterEap
						naceLetter: $filterNace
						entityType: $filterEntityType
						sector: $filterSector
					) {
						pagination {
							total
							perPage
							currentPage
							lastPage
							firstPage
						}
						data {
							id
							establishmentNumber
							enterpriseNumber
							name
							form
							sector
							naceLetter
							reliabilityIndex
							coordinates {
								longitude
								latitude
							}
							economicalActivityPark {
								name
								codeCarto
							}
							__typename
						}
					}
				}
			`,
			variables: queryVariables,
		});

		const enterprises = response.data.enterprises.data;

		try {
			const parser = new Parser();
			// @ts-ignore
			let enterprisesCopy = [...enterprises].map(({ __typename, id, ...rest }) => rest);
			// Remove __typename from coordinates
			enterprisesCopy = enterprisesCopy.map((enterprise) => {
				if (enterprise.coordinates) {
					// @ts-ignore
					const { __typename, ...rest } = enterprise.coordinates;
					// Round coordinates to 6 decimals
					rest.latitude = Number(rest.latitude.toFixed(6));
					rest.longitude = Number(rest.longitude.toFixed(6));

					return { ...enterprise, coordinates: rest };
				}
				return enterprise;
			});
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
			{/* Circle */}
			{!drawingState.drawnFeature && !drawingState.drawnCircleRadius && (
				<Button
					onClick={handleSetDrawingCircle}
					variant="outline"
					size="icon"
					className={`h-12 w-12 rounded-full border-2 border-red-600 mb-4 ${drawingState.isDrawingCircle ? 'bg-gray-300' : ''}`}
				>
					<CircleDotDashed className="h-6 w-6" />
				</Button>
			)}

			{/* Polygon */}
			{!drawingState.drawnFeature && !drawingState.drawnCircleRadius && (
				<Button
					onClick={handleSetDrawingPolygon}
					variant="outline"
					size="icon"
					className={`h-12 w-12 rounded-full border-2 border-red-600 mb-4 ${drawingState.isDrawingPolygon ? 'bg-gray-300' : ''}`}
				>
					<Pencil className="h-6 w-6" />
				</Button>
			)}
			{(drawingState.drawnFeature || drawingState.drawnCircleRadius) && (
				<Button
					onClick={handleClearDraw}
					variant="outline"
					size="icon"
					className={`h-12 w-12 rounded-full border-2 border-gray-600 mb-4 bg-gray-300`}
				>
					<Eraser className="h-6 w-6" />
				</Button>
			)}
			{/* Export */}
			{!isExporting && (
				<Button
					onClick={handleExport}
					variant="outline"
					size="icon"
					className="h-12 w-12 rounded-full border-2 border-red-600 mb-4"
				>
					<Download className="h-6 w-6" />
				</Button>
			)}
			{isExporting && (
				<Button
					disabled
					variant="outline"
					size="icon"
					className="h-12 w-12 rounded-full border-2 border-red-600 mb-4"
				>
					<ReloadIcon className="h-6 w-6 animate-spin" />
				</Button>
			)}
		</div>
	);
}
