import React from 'react';
import { isDefined } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';
import RegionSelector from '#components/RegionSelector';
import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import BudgetFlowSankey from '#components/BudgetFlowSankey';

import useRequest from '#hooks/useRequest';
import { SankeyData } from '#types';
import { prepareUrlParams as p } from '#utils/common';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';

// FIXME: change this to Node type
const sankeyColorSelector = (item: { depth: number }) => ['red', 'blue', 'green'][item.depth];

const sankeyNameSelector = (item: { name: string }) => item.name;

interface Props {
    programs: number[];
    regions: number[];
    onRegionsChange: (value: number[]) => void;
}

function RegionSankey(props: Props) {
    const {
        programs,
        regions,
        onRegionsChange,
    } = props;

    const params = p({
        program: programs,
        province: regions,
        threshold: 1,
    });

    const sankeyUrl = `${apiEndPoint}/core/sankey-region/?${params}`;

    interface Node {
        name: string;
    }

    const [
        sankeyPending,
        sankeyResponse,
    ] = useRequest<SankeyData<Node>>(sankeyUrl, 'sankey-data');

    return (
        <>
            <div className={styles.tableActions}>
                <RegionSelector
                    regionLevel="province"
                    selectionHidden
                    regions={regions}
                    onRegionsChange={onRegionsChange}
                />
                {sankeyResponse && isDefined(sankeyResponse.minThreshold) && (
                    <div className={styles.info}>
                        <span>
                            Only showing budget flow greater than
                        </span>
                        <Numeral
                            className={styles.numeral}
                            value={sankeyResponse.minThreshold}
                            prefix="£"
                        />
                    </div>
                )}
            </div>
            <div className={styles.sankey}>
                {sankeyPending && (
                    <Backdrop className={styles.backdrop}>
                        <LoadingAnimation />
                    </Backdrop>
                )}
                <BudgetFlowSankey
                    data={sankeyResponse}
                    colorSelector={sankeyColorSelector}
                    nameSelector={sankeyNameSelector}
                />
            </div>
        </>
    );
}

export default RegionSankey;
