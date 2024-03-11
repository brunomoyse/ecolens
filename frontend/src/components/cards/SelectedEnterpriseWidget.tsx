import { useMap } from '@/context/map-context';
import { useDraggable } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatDateBE } from '@/lib/utils';
import { List, X } from 'lucide-react';
import { setSelectedEnterprise } from '@/store/slices/enterpriseSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getSectorTranslation = (sector: string) => {
	if (sector === 'PRIMARY') return 'Primaire';
	if (sector === 'SECONDARY') return 'Secondaire';
	if (sector === 'TERTIARY') return 'Tertiaire';
};

export default function SelectedEnterpriseWidget() {
	useDraggable('selected-enterprise-widget', 'drag-selected-enterprise-widget');
	const dispatch = useAppDispatch();
	const selectedEnterprise = useAppSelector((state) => state.enterprise.selectedEnterprise);

	const unselectEnterprise = () => {
		dispatch(setSelectedEnterprise(null));
	};

	if (!selectedEnterprise) return;

	return (
		<aside
			id="selected-enterprise-widget"
			className="absolute z-20 right-24 top-12 bg-gray-200 rounded-3xl shadow-lg overflow-hidden"
		>
			<header
				id="drag-selected-enterprise-widget"
				className="flex cursor-move justify-between py-4 px-6 bg-gray-300 rounded-t-3xl"
			>
				<div className="flex">
					<List className="h-6 w-6 mr-3" />
					<h2 className="text-xl font-bold text-center pl-1 mr-4 select-none">Détail</h2>
				</div>
				<X onClick={unselectEnterprise} className="w-6 h-6 z-50 cursor-pointer" />
			</header>
			<Tabs defaultValue="info" className="w-[400px] max-w-[400px]">
				<TabsList className="flex">
					<TabsTrigger value="info" className="w-full">
						Informations
					</TabsTrigger>
					<TabsTrigger value="report" className="w-full">
						Bilan
					</TabsTrigger>
				</TabsList>
				<TabsContent value="info">
					<div className="p-6">
						<ul className="list-disc space-y-2">
							<li>
								<strong>Nom:</strong> {selectedEnterprise.name}
							</li>
							<li>
								<strong>N° d&apos;unité d&apos;établissement:</strong>{' '}
								{selectedEnterprise.establishmentNumber}
							</li>
							<li>
								<strong>N° d&apos;entreprise:</strong> {selectedEnterprise.enterpriseNumber}
							</li>
							<li>
								<strong>Forme juridique:</strong> {selectedEnterprise.form}
							</li>
							<li>
								<strong>Date de création:</strong> {formatDateBE(selectedEnterprise.startDate!)}
							</li>
							<li>
								<strong>Secteur d&apos;activité:</strong>{' '}
								{getSectorTranslation(selectedEnterprise.sector!)}
							</li>
							<li>
								<strong>NACE principal:</strong> {selectedEnterprise.naceMain}
							</li>
							<li>
								<strong>Autres NACE:</strong>{' '}
								{selectedEnterprise.naceOther?.map((n) => {
									return <span key={n}> {n} </span>;
								})}
							</li>
							<li>
								<strong>Indice fiabilité:</strong> {selectedEnterprise.reliabilityIndex}/10
							</li>
							{selectedEnterprise.economicalActivityPark && (
								<li>
									<strong>PAE:</strong> {selectedEnterprise.economicalActivityPark.name}
								</li>
							)}
							{selectedEnterprise.address && (
								<li>
									<strong>Adresse:</strong> {selectedEnterprise.address?.streetName}{' '}
									{selectedEnterprise.address?.streetNumber}, {selectedEnterprise.address?.postalCode}{' '}
									{selectedEnterprise.address?.municipality}
									<span className="text-sm text-gray-500">(Indice de fiabilité: élevé)</span>
								</li>
							)}
						</ul>
					</div>
				</TabsContent>
				<TabsContent value="report"></TabsContent>
			</Tabs>
		</aside>
	);
}
