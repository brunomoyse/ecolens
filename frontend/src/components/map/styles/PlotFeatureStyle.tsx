// featureStyles.ts
import { Style, Text } from 'ol/style';
import Stroke from 'ol/style/Stroke';
import { FeatureLike } from 'ol/Feature';

// Define a generic style function for features
export const getPlotStyle = (feature: FeatureLike): Style => {
	return new Style({
		text: new Text({
			text: feature.get('capakey'),
			font: '12px Arial,sans-serif',
		}),
		stroke: new Stroke({
			color: 'rgba(0, 0, 0, 0.6)',
			width: 1,
		}),
	});
};
