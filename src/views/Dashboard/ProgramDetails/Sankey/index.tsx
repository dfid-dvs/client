import React from 'react';
import { isDefined } from '@togglecorp/fujs';

import Numeral from '#components/Numeral';
import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import BudgetFlowSankey from '#components/BudgetFlowSankey';

import useRequest from '#hooks/useRequest';
import { SankeyData } from '#types';
import { prepareUrlParams as p } from '#utils/common';
import { apiEndPoint, tableauColors } from '#utils/constants';

import styles from './styles.css';

// FIXME: change this to Node type
const sankeyColorSelector = (item: { depth: number }) => tableauColors[item.depth];

const sankeyNameSelector = (item: { name: string }) => item.name;

interface Props {
    programs: number[];
}

function ProgramSankey(props: Props) {
    const {
        programs,
    } = props;

    const params = p({
        program: programs,
        threshold: 0.6,
    });

    const sankeyUrl = `${apiEndPoint}/core/sankey-program/?${params}`;

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
                    <Backdrop>
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

export default ProgramSankey;
