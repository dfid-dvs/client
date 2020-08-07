import React from 'react';
import styles from './styles.css';

import useRequest from '#hooks/useRequest';
import { apiEndPoint } from '#utils/constants';
import {
    MultiResponse,
} from '#types';

import LoadingAnimation from '#components/LoadingAnimation';
import Backdrop from '#components/Backdrop';
import Numeral from '#components/Numeral';
import { ExtractKeys } from '#utils/common';

interface Output {
    id: number;
    indicator: string;
    maleForecast_2011: number;
    disabilityForecast_2011: number;
    femaleForecast_2011: number;
    totalForecast_2011: number;
    maleAchieved_2011: number;
    femaleAchieved_2011: number;
    disabilityAchieved_2011: number;
    totalAchieved_2011: number;
    maleForecast_2012: number;
    femaleForecast_2012: number;
    disabilityForecast_2012: number;
    totalForecast_2012: number;
    maleAchieved_2012: number;
    femaleAchieved_2012: number;
    disabilityAchieved_2012: number;
    totalAchieved_2012: number;
    maleForecast_2013: number;
    femaleForecast_2013: number;
    disabilityForecast_2013: number;
    totalForecast_2013: number;
    maleAchieved_2013: number;
    femaleAchieved_2013: number;
    disabilityAchieved_2013: number;
    totalAchieved_2013: number;
    maleForecast_2014: number;
    femaleForecast_2014: number;
    disabilityForecast_2014: number;
    totalForecast_2014: number;
    maleAchieved_2014: number;
    femaleAchieved_2014: number;
    disabilityAchieved_2014: number;
    totalAchieved_2014: number;
    maleForecast_2015: number;
    femaleForecast_2015: number;
    disabilityForecast_2015: number;
    totalForecast_2015: number;
    maleAchieved_2015: number;
    femaleAchieved_2015: number;
    disabilityAchieved_2015: number;
    totalAchieved_2015: number;
    maleForecast_2016: number;
    femaleForecast_2016: number;
    disabilityForecast_2016: number;
    totalForecast_2016: number;
    maleAchieved_2016: number;
    femaleAchieved_2016: number;
    disabilityAchieved_2016: number;
    totalAchieved_2016: number;
    maleForecast_2017: number;
    femaleForecast_2017: number;
    disabilityForecast_2017: number;
    totalForecast_2017: number;
    maleAchieved_2017: number;
    femaleAchieved_2017: number;
    disabilityAchieved_2017: number;
    totalAchieved_2017: number;
    maleForecast_2018: number;
    femaleForecast_2018: number;
    disabilityForecast_2018: number;
    totalForecast_2018: number;
    maleAchieved_2018: number;
    femaleAchieved_2018: number;
    disabilityAchieved_2018: number;
    totalAchieved_2018: number;
    maleForecast_2019: number;
    femaleForecast_2019: number;
    disabilityForecast_2019: number;
    totalForecast_2019: number;
    maleAchieved_2019: number;
    femaleAchieved_2019: number;
    disabilityAchieved_2019: number;
    totalAchieved_2019: number;
}

type numericKeys = ExtractKeys<Output, number>;

const years = [
    2011,
    2012,
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019,
];

function Output() {
    const outputGetRequest = `${apiEndPoint}/core/output/`;
    const [
        outputListPending,
        outputListResponse,
    ] = useRequest<MultiResponse<Output>>(outputGetRequest, 'outputs');

    return (
        <div className={styles.output}>
            <h1 className={styles.heading}>
                Output
            </h1>
            {outputListPending && (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            )}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <tr>
                        <th
                            className={styles.indicatorCol}
                            rowSpan={3}
                        >
                            Indicators
                        </th>
                        {years.map(year => (
                            <th
                                key={year}
                                colSpan={8}
                            >
                                {year}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        {years.map(year => (
                            <>
                                <th
                                    key={`${year}_forecast`}
                                    colSpan={4}
                                >
                                    Forecast
                                </th>
                                <th
                                    key={`${year}_achieved`}
                                    colSpan={4}
                                >
                                    Achieved
                                </th>
                            </>
                        ))}
                    </tr>
                    <tr>
                        {years.map(year => (
                            <>
                                <th key={`${year}_forecast_male`}>
                                    Male
                                </th>
                                <th key={`${year}_forecast_female`}>
                                    Female
                                </th>
                                <th key={`${year}_forecast_disability`}>
                                    Disability
                                </th>
                                <th key={`${year}_forecast_total`}>
                                    Total
                                </th>
                                <th key={`${year}_achieved_male`}>
                                    Male
                                </th>
                                <th key={`${year}_achieved_female`}>
                                    Female
                                </th>
                                <th key={`${year}_achieved_disability`}>
                                    Disability
                                </th>
                                <th key={`${year}_achieved_total`}>
                                    Total
                                </th>
                            </>
                        ))}
                    </tr>
                    {outputListResponse?.results.map(item => (
                        <tr
                            className={styles.dataRow}
                            key={item.id}
                        >
                            <td key="indicator">
                                {item.indicator}
                            </td>
                            {years.map(year => (
                                <>
                                    <td key={`${year}_forecast_male`}>
                                        <Numeral
                                            value={item[`maleForecast_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                    <td key={`${year}_forecast_female`}>
                                        <Numeral
                                            value={item[`femaleForecast_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                    <td key={`${year}_forecast_disability`}>
                                        <Numeral
                                            value={item[`disabilityForecast_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                    <td key={`${year}_forecast_total`}>
                                        <Numeral
                                            value={item[`totalForecast_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                    <td key={`${year}_achieved_male`}>
                                        <Numeral
                                            value={item[`maleAchieved_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                    <td key={`${year}_achieved_female`}>
                                        <Numeral
                                            value={item[`femaleAchieved_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                    <td key={`${year}_achieved_disability`}>
                                        <Numeral
                                            value={item[`disabilityAchieved_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                    <td key={`${year}_achieved_total`}>
                                        <Numeral
                                            value={item[`totalAchieved_${year}` as numericKeys]}
                                            normalize
                                        />
                                    </td>
                                </>
                            ))}
                        </tr>
                    ))}
                </table>
            </div>
        </div>
    );
}

export default Output;
