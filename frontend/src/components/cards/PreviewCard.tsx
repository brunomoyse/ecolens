// Popup.tsx
import React from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Enterprise } from '@/types';
import { fetchEnterprise, setSelectedEnterprise } from '@/store/slices/enterpriseSlice';
import { setSelectedEnterprises } from '@/store/slices/enterpriseSlice';

interface PreviewCardMapProps {
	coordinate: [number, number] | undefined;
}

const PreviewCardMap: React.FC<PreviewCardMapProps> = ({ coordinate }) => {
	const dispatch = useAppDispatch();
	const selectedEnterprises = useAppSelector((state) => state.enterprise.selectedEnterprises);

	if (!coordinate || !selectedEnterprises || selectedEnterprises?.length === 0) return null;

	const positionStyle = {
		left: `${coordinate[0]}px`,
		top: `${coordinate[1]}px`,
	};

	const handleSelectEnterprise = async (enterprise: Enterprise) => {
		dispatch(fetchEnterprise({ id: enterprise.id }));
		dispatch(setSelectedEnterprises([]));
	};

	return (
		<div style={positionStyle} className="absolute z-10 p-1 bg-gray-100">
			<ScrollArea className={`${selectedEnterprises.length > 4 ? 'h-48' : 'h-auto'} rounded-md border`}>
				<div className="p-2">
					{selectedEnterprises.map((enterprise: any, index) => (
						<div key={enterprise.id}>
							<div
								onClick={() => handleSelectEnterprise(enterprise)}
								className="flex text-md items-center px-2 py-1 hover:bg-gray-300 rounded-lg cursor-pointer"
							>
								{enterprise.name}
							</div>
							{index !== selectedEnterprises.length - 1 && <Separator className="my-1" />}
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	);
};

export default PreviewCardMap;
