import React from 'react';
import useRequest from '#hooks/useRequest';
import { MultiResponse } from '#types';
import { apiEndPoint } from '#utils/constants';

import styles from './styles.css';
import Backdrop from '#components/Backdrop';
import LoadingAnimation from '#components/LoadingAnimation';

interface UrlOptions {
    id: number;
    title: string;
    url: string;
}

const NationalStatistics = () => {
    const urlOptionsUrl = `${apiEndPoint}/core/national-statistic/`;

    const [
        urlOptionsPending,
        urlOptionsResponse,
    ] = useRequest<MultiResponse<UrlOptions>>(urlOptionsUrl, 'navbar-url-options');

    const urlOption = urlOptionsResponse?.results[0];
    const vizUrl = urlOption ? `${urlOption.url}&:showVizHome=no` : undefined;

    return (
        <div className={styles.container}>
            {urlOptionsPending ? (
                <Backdrop>
                    <LoadingAnimation />
                </Backdrop>
            ) : (
            <iframe
                frameBorder="0"
                height="820"
                width="100%"
                src={vizUrl}
                title={urlOption?.title}
            />)}
        </div>
    );
};

export default NationalStatistics;
