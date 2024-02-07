// featureStyles.ts
import {Style, Fill} from 'ol/style';
import Stroke from "ol/style/Stroke";
import {FeatureLike} from "ol/Feature";

// Define a generic style function for features
export const getPaeFeatureStyle = (feature: FeatureLike): Style => {
    // Access a property of the feature
    const propertyValue = feature.get('NATURE');

    // Apply different styles based on the property value
    if (propertyValue === 'PRE') {
        // PRE: Parc de reconnaissance économique (vert)
        return new Style({
            fill: new Fill({
                color: 'rgba(213, 255, 189, 0.4)',
            }),
            // Border #996600 rgba(153, 102, 0, 1)
            stroke: new Stroke({
                color: 'rgba(153, 102, 0, 1)',
                width: 2
            })
        });

    } else if (propertyValue === 'DRPRE') {
        // DRPRE: Droit de préemption (jaune)
        return new Style({
            fill: new Fill({
                color: 'rgba(254, 236, 176, 0.4)',
            }),
            // Border #996600 rgba(153, 102, 0, 1)
            stroke: new Stroke({
                color: 'rgba(153, 102, 0, 1)',
                width: 2
            })
        });
    } else if (propertyValue === 'PEX') {
        // PEX: Périmètre d'expropriation (rouge)
        return new Style({
            fill: new Fill({
                color: 'rgba(253, 191, 233, 0.4)',
            }),
            // Border #996600 rgba(153, 102, 0, 1)
            stroke: new Stroke({
                color: 'rgba(153, 102, 0, 1)',
                width: 2
            })
        });
    }

    // Default style if no conditions are met
    return new Style({
        fill: new Fill({
            color: 'rgba(0, 0, 0, 0.1)', // Example default style
        }),
    });
};
