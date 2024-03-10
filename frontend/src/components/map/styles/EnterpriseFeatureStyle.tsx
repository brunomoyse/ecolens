// featureStyles.ts
import {Style, Fill} from 'ol/style';
import {FeatureLike} from "ol/Feature";
import Circle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";

interface EnterpriseFilter {
    mapEnterpriseIds: Set<string>
}

// Green
const primaryStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: '#22C55E'
        }),
    })
});


// Red
const secondaryStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: '#EF4444'
        }),
    })
});


// Blue
const tertiaryStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: '#3B82F6'
        }),
    })
});

// Grey
const defaultStyle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: '#475569'
        }),
    }),
    stroke: new Stroke({
        color: '#0A0A0A',
        width: 1
    })
});

// Define a generic style function for features
export const createGetEnterpriseFeatureStyle = (filter: EnterpriseFilter | undefined) => {
    return (feature: FeatureLike): Style => {
        // Access the sector property of the feature
        const sectorPropertyValue = feature.get('sector');

        // Apply filter to the style based on all uuids in the store
        if (filter?.mapEnterpriseIds) {
            const filteredPropertyValue = feature.get('id');
            if (!filter.mapEnterpriseIds.has(filteredPropertyValue)) {
                return new Style();
            }
        }

        // Apply different styles based on the sector property value
        if (sectorPropertyValue === 'PRIMARY') return primaryStyle;
        else if (sectorPropertyValue === 'SECONDARY') return secondaryStyle;
        else if (sectorPropertyValue === 'TERTIARY') return tertiaryStyle;
        else return defaultStyle;
    };
};
