import React from 'react';
import {
    XAxis,
    YAxis,
    BarChart,
    Bar,
} from 'recharts';

import {
    FiveW,
    FiveWOptionKey,
} from '../../types';

interface Props {
    multiColumn?: boolean;
    fiveWData: FiveW[];
    dataKey?: string;
}

const fiveWKeyLabel: {[key in FiveWOptionKey]: string} = {
    allocatedBudget: 'Allocated Budget',
    maleBeneficiary: 'Male Beneficiary',
    femaleBeneficiary: 'Female Beneficiary',
    totalBeneficiary: 'Total Beneficiary',
};

function Charts(props: Props) {
    const {
        fiveWData,
        dataKey,
    } = props;

    if (!dataKey || fiveWData.length === 0) {
        return null;
    }
    const chartTitle = fiveWKeyLabel[dataKey as FiveWOptionKey];

    return (
        <div>
            <div>
                {chartTitle}
            </div>
            <div>
                <BarChart
                    width={480}
                    height={360}
                    data={fiveWData}
                    layout="vertical"
                >
                    <XAxis
                        dataKey={dataKey}
                        type="number"
                    />
                    <Bar
                        fill="#e04656"
                        dataKey={dataKey}
                        layout="vertical"
                    />
                    <YAxis
                        width={110}
                        dataKey="name"
                        type="category"
                    />
                </BarChart>
            </div>
        </div>
    );
}

export default Charts;
