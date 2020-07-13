import React, { useMemo } from 'react';
import {
    _cs,
    isDefined,
    unique,
} from '@togglecorp/fujs';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import TextOutput from '#components/TextOutput';
import Numeral from '#components/Numeral';

import useRequest from '#hooks/useRequest';

import { apiEndPoint } from '#utils/constants';
import { prepareUrlParams as p } from '#utils/common';

import {
    RegionLevelOption,
} from '#types';

import styles from './styles.css';

interface BadgeProps {
    className?: string;
    title: string;
    value?: React.ReactNode | null;
}

function Badge(props: BadgeProps) {
    const {
        className,
        title,
        value,
    } = props;

    return (
        <div className={_cs(styles.badge, className)}>
            <div className={styles.title}>
                {title}
            </div>
            {isDefined(value) && (
                <div className={styles.value}>
                    {value}
                </div>
            )}
        </div>
    );
}

interface Region {
    id: number;
    name: string;
}

interface Sector {
    id: number;
    sector: string;
}

interface Partner {
    id: number;
    name: string;
    partnerBudget: number;
}

interface Component {
    id: number;
    name: string;
    componentBudget: number;
    partners: Partner[];
    sectors: Sector[];
}

interface Program {
    id: number;
    program: string;
    programBudget: number;
    components: Component[];
}

interface PopupData {
    totalBudget: number;
    programs?: Program[];
}

interface Props {
    feature: GeoJSON.Feature<GeoJSON.Polygon, Region>;
    regionLevel: RegionLevelOption;
    programs: number[];
}

const Tooltip = (props: Props) => {
    const {
        feature: {
            properties: {
                id,
                name,
            },
        },
        regionLevel,
        programs,
    } = props;

    const popupDataUrl = useMemo(() => {
        const urlParams = {
            field: `${regionLevel}_id__code`,
            value: id,
            programs,
        };

        return `${apiEndPoint}/core/popup/?${p(urlParams)}`;
    }, [regionLevel, programs, id]);

    const [
        popupDataPending,
        popupDataResponse,
    ] = useRequest<PopupData>(popupDataUrl, '');

    const details = popupDataResponse;

    return (
        <div className={styles.tooltip}>
            {popupDataPending && (
                <Backdrop className={styles.backdrop}>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.header}>
                <h2 className={styles.heading}>
                    { name }
                </h2>
                {isDefined(details) && (
                    <TextOutput
                        noPadding
                        label="Total Budget (£)"
                        value={(<Numeral value={details.totalBudget} />)}
                    />
                )}
            </div>
            {isDefined(details) && (
                <div className={styles.scrollWrapper}>
                    {details?.programs?.map((program, pIndex) => (
                        <div
                            className={styles.program}
                            key={program.id}
                        >
                            <div className={styles.programHeader}>
                                <h3 className={styles.programTitle}>
                                    {`${pIndex + 1}. ${program.program}`}
                                </h3>
                                <TextOutput
                                    noPadding
                                    label="Total Budget (£)"
                                    value={(<Numeral value={program.programBudget} />)}
                                />
                            </div>
                            <div className={styles.components}>
                                {program?.components?.length > 0 && (
                                    <div className={styles.componentsHeader}>
                                        Components
                                    </div>
                                )}
                                {program?.components?.map((component, cIndex) => (
                                    <div
                                        className={styles.component}
                                        key={component.id}
                                    >
                                        <h4 className={styles.componentTitle}>
                                            {`${pIndex + 1}.${cIndex + 1}. ${component.name}`}
                                        </h4>
                                        <div className={styles.componentDetails}>
                                            <TextOutput
                                                noPadding
                                                label="Total Budget (£)"
                                                value={(
                                                    <Numeral value={component.componentBudget} />
                                                )}
                                            />
                                            <h5 className={styles.sectorTitle}>
                                                Sectors
                                            </h5>
                                            <ul className={styles.sectorList}>
                                                {(unique(
                                                    component?.sectors,
                                                    d => d.sector,
                                                )?.map(sector => (
                                                    <li
                                                        key={id}
                                                        className={styles.sectorItem}
                                                    >
                                                        <Badge title={sector.sector} />
                                                    </li>
                                                )))}
                                            </ul>
                                            <h5 className={styles.partnerTitle}>
                                                Partners
                                            </h5>
                                            <ul className={styles.partnerList}>
                                                {(component?.partners?.map(partner => (
                                                    <li
                                                        key={id}
                                                        className={styles.partnerItem}
                                                    >
                                                        <Badge
                                                            title={partner.name}
                                                            value={(
                                                                <Numeral
                                                                    value={partner.partnerBudget}
                                                                />
                                                            )}
                                                        />
                                                    </li>
                                                )))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Tooltip;
