// featureStyles.ts
import {Style, Fill} from 'ol/style';
import {FeatureLike} from "ol/Feature";
import Circle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";

// Define a generic style function for features
export const getEnterpriseFeatureStyle = (feature: FeatureLike): Style => {
    // Access a property of the feature
    const propertyValue = feature.get('sector');

    // Apply different styles based on the property value
    if (propertyValue === 'PRIMARY') {
        return new Style({
            image: new Circle({
                radius: 5,
                fill: new Fill({
                    color: '#22C55E'
                }),
            })
        });
    } else if (propertyValue === 'SECONDARY') {
        return new Style({
            image: new Circle({
                radius: 5,
                fill: new Fill({
                    color: '#EF4444'
                }),
            })
        });
    } else if (propertyValue === 'TERTIARY') {
        return new Style({
            image: new Circle({
                radius: 5,
                fill: new Fill({
                    color: '#3B82F6'
                }),
            })
        });
    }

    // Default style if no conditions are met
    return new Style({
        image: new Circle({
            radius: 5,
            fill: new Fill({
                color: '#475569'
            }),
        }),
        stroke: new Stroke({
            color: '#0A0A0A', // Red stroke color
            width: 1
        })
    });
};
