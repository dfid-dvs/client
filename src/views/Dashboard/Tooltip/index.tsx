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
    region: Region;
    regionLevel: RegionLevelOption;
    programs: number[];
    className?: string;
}

const Tooltip = (props: Props) => {
    const {
        region: {
            id,
            name,
        },
        regionLevel,
        programs,
        className,
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
        <div className={_cs(className, styles.tooltip)}>
            <div className={styles.header}>
                <h2 className={styles.heading}>
                    { name }
                </h2>
                {isDefined(details) && (
                    <TextOutput
                        className={styles.totalBudget}
                        label="Total Budget (£)"
                        value={(
                            <Numeral
                                value={details.totalBudget}
                                className={styles.value}
                            />
                        )}
                        multiline
                        labelClassName={styles.label}
                    />
                )}
            </div>
            <div className={styles.scrollWrapper}>
                {popupDataPending && (
                    <Backdrop className={styles.backdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                {details?.programs?.map((program, pIndex) => (
                    <div
                        className={styles.program}
                        key={program.id}
                    >
                        <div className={styles.programHeader}>
                            <h3 className={styles.programTitle}>
                                <div className={styles.number}>
                                    { pIndex + 1 }
                                </div>
                                <div className={styles.text}>
                                    { program.program }
                                </div>
                            </h3>
                            <div className={styles.bottomRow}>
                                <div className={styles.dummy} />
                                <div className={styles.budgetWrapper}>
                                    <TextOutput
                                        className={styles.totalBudget}
                                        label="Total Budget (£)"
                                        labelClassName={styles.label}
                                        value={(
                                            <Numeral
                                                value={program.programBudget}
                                                className={styles.value}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.components}>
                            {program?.components?.length > 0 && (
                                <h4 className={styles.componentsHeader}>
                                    Components
                                </h4>
                            )}
                            {program?.components?.map((component, cIndex) => (
                                <div
                                    className={styles.component}
                                    key={component.id}
                                >
                                    <h5 className={styles.componentHeading}>
                                        <div className={styles.number}>
                                            {`${pIndex + 1}.${cIndex + 1}`}
                                        </div>
                                        <div className="text">
                                            {component.name}
                                        </div>
                                    </h5>
                                    <div className={styles.componentDetails}>
                                        <div className={styles.dummy} />
                                        <div className={styles.secondCell}>
                                            <TextOutput
                                                className={styles.totalBudget}
                                                label="Total Budget (£)"
                                                labelClassName={styles.label}
                                                value={(
                                                    <Numeral
                                                        className={styles.value}
                                                        value={component.componentBudget}
                                                    />
                                                )}
                                            />
                                            { component?.sectors.length > 0 && (
                                                <>
                                                    <h6 className={styles.sectorTitle}>
                                                        Sectors
                                                    </h6>
                                                    <div className={styles.sectorList}>
                                                        {(unique(
                                                            component?.sectors,
                                                            d => d.sector,
                                                        )?.map(sector => (
                                                            <div
                                                                key={id}
                                                                className={styles.sectorItem}
                                                            >
                                                                <Badge title={sector.sector} />
                                                            </div>
                                                        )))}
                                                    </div>
                                                </>
                                            )}
                                            { component?.partners.length > 0 && (
                                                <>
                                                    <h6 className={styles.partnerTitle}>
                                                        Partners
                                                    </h6>
                                                    <div className={styles.partnerList}>
                                                        {(component?.partners?.map(partner => (
                                                            <div
                                                                key={id}
                                                                className={styles.partnerItem}
                                                            >
                                                                <Badge
                                                                    title={partner.name}
                                                                    value={(
                                                                        <Numeral
                                                                            className={
                                                                                styles
                                                                                    .numeralValue
                                                                            }
                                                                            value={
                                                                                partner
                                                                                    .partnerBudget
                                                                            }
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        )))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Tooltip;
