import React from 'react';
import { _cs } from '@togglecorp/fujs';

import MultiSelectInput from '#components/MultiSelectInput';
import SelectInput from '#components/SelectInput';
import ToggleButton from '#components/ToggleButton';

import styles from './styles.css';
import { FiveWOption } from '../types';
import { Indicator, Layer, RasterLayer, VectorLayer } from '#types';

const fiveWKeySelector = (option: FiveWOption) => option.key;
const fiveWLabelSelector = (option: FiveWOption) => option.label;

const layerKeySelector = (d: Layer) => d.id;
const layerLabelSelector = (d: Layer) => d.name;

const indicatorKeySelector = (indicator: Indicator) => indicator.id;
const indicatorLabelSelector = (indicator: Indicator) => indicator.fullTitle;
const indicatorGroupKeySelector = (indicator: Indicator) => indicator.category;

interface MapOptionsProps {
    className?: string;
    fiveWOptions: FiveWOption[];
    selectedFiveWOption: string | undefined;
    handleFiveWOptionChange: (fiveWOption: string | undefined) => void;
    indicatorListPending: boolean;
    indicatorList: Indicator[] | undefined;
    setSelectedIndicator: React.Dispatch<React.SetStateAction<number | undefined>>;
    validSelectedIndicator: number | undefined;
    selectedIndicatorDetails: Indicator | undefined;
    mapStyleInverted: boolean;
    setMapStyleInverted: React.Dispatch<React.SetStateAction<boolean>>;
    mapLayerListPending: boolean;
    vectorLayers: VectorLayer[] | undefined;
    setSelectedVectorLayers: React.Dispatch<React.SetStateAction<number[] | undefined>>;
    selectedVectorLayers: number[] | undefined;
    // rasterLayers?: RasterLayer[] | undefined;
    // setSelectedRasterLayer?: React.Dispatch<React.SetStateAction<number | undefined>>;
    // selectedRasterLayer?: number | undefined;
}

export default function MapOptions(props: MapOptionsProps) {
    const {
        className,
        fiveWOptions,
        selectedFiveWOption,
        handleFiveWOptionChange,
        indicatorListPending,
        indicatorList,
        setSelectedIndicator,
        validSelectedIndicator,
        selectedIndicatorDetails,
        mapStyleInverted,
        setMapStyleInverted,
        mapLayerListPending,
        vectorLayers,
        setSelectedVectorLayers,
        selectedVectorLayers,
    } = props;
    return (
        <div className={_cs(styles.mapSelectorContainer, className)}>
            <SelectInput
                placeholder="Data type"
                className={styles.inputItem}
                options={fiveWOptions}
                onChange={handleFiveWOptionChange}
                value={selectedFiveWOption}
                optionLabelSelector={fiveWLabelSelector}
                optionKeySelector={fiveWKeySelector}
            />
            <SelectInput
                placeholder="Indicator"
                className={styles.inputItem}
                disabled={indicatorListPending}
                options={indicatorList}
                onChange={setSelectedIndicator}
                value={validSelectedIndicator}
                optionLabelSelector={indicatorLabelSelector}
                optionKeySelector={indicatorKeySelector}
                groupKeySelector={indicatorGroupKeySelector}
                pending={indicatorListPending}
            />
            {selectedIndicatorDetails && (
                <div className={styles.indicatorInfo}>
                    {selectedIndicatorDetails.abstract && (
                        <div className={styles.abstract}>
                            {selectedIndicatorDetails.abstract}
                        </div>
                    )}
                    {selectedIndicatorDetails.source && (
                        <div className={styles.titleValue}>
                            <div className={styles.title}>
                                Source:
                            </div>
                            <div className={styles.value}>
                                {selectedIndicatorDetails.source}
                            </div>
                        </div>
                    )}
                    {selectedIndicatorDetails.unit && (
                        <div
                            className={_cs(
                                styles.titleValue,
                                styles.flex,
                            )}
                        >
                            <div className={styles.title}>
                                Unit:
                            </div>
                            <div className={styles.value}>
                                {selectedIndicatorDetails.unit}
                            </div>
                        </div>
                    )}
                    {selectedIndicatorDetails.url && (
                        <a
                            className={styles.url}
                            href={selectedIndicatorDetails.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View Link
                        </a>
                    )}
                </div>
            )}
            <ToggleButton
                label="Toggle Choropleth/Bubble"
                className={styles.inputItem}
                value={mapStyleInverted}
                onChange={setMapStyleInverted}
            />
            <div className={styles.separator} />
            <MultiSelectInput
                placeholder="Layers"
                className={styles.inputItem}
                disabled={mapLayerListPending}
                options={vectorLayers}
                onChange={setSelectedVectorLayers}
                value={selectedVectorLayers}
                optionKeySelector={layerKeySelector}
                optionLabelSelector={layerLabelSelector}
            />
            {/* NOTE: Hidden for now as per clients's request. */}
            {/* <SelectInput
                placeholder="Background Layer"
                className={styles.inputItem}
                disabled={mapLayerListPending}
                options={rasterLayers}
                onChange={setSelectedRasterLayer}
                value={selectedRasterLayer}
                optionKeySelector={layerKeySelector}
                optionLabelSelector={layerLabelSelector}
            /> */}
        </div>
    );
}
