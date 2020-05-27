import { saveAs } from 'file-saver';
import { isNotDefined } from '@togglecorp/fujs';

// FIXME: move this somewhere nice
interface Row {
    [key: string]: string | number | boolean | undefined | null;
}
export function convertTableData<T>(
    data: T[] | undefined | null,
    columns: {
        id: string;
        title: string;
    }[],
    transformers: {
        [key: string]: (datum: T) => string | number | boolean | undefined | null;
    },
) {
    if (!data) {
        return undefined;
    }

    return data.map((datum) => {
        const val: Row = {};
        columns.forEach((header) => {
            const {
                id,
                title,
            } = header;
            const transformer = transformers[id];
            const value = transformer ? transformer(datum) : undefined;
            val[title] = value;
        });
        return val;
    });
}

export function convertJsonToCsv(
    data: Row[] | undefined | null,
    columnDelimiter = ',',
    lineDelimiter = '\n',
    emptyValue = '',
) {
    if (!data || data.length <= 0) {
        return undefined;
    }

    // TODO: get exhaustive keys
    const keys = Object.keys(data[0]);

    let result = keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach((item) => {
        result += keys
            .map(key => item[key])
            .map((str) => {
                if (isNotDefined(str)) {
                    return emptyValue;
                }
                const val = String(str);
                if (val.includes(columnDelimiter)) {
                    return `"${val}"`;
                }
                return val;
            })
            .join(columnDelimiter);
        result += lineDelimiter;
    });

    return result;
}

function useDownloading(name: string, value: Row[] | undefined | null) {
    const handleClick = () => {
        const csv = convertJsonToCsv(value);
        if (!csv) {
            return;
        }

        const blob = new Blob([csv], { type: 'text/csv' });

        const currentTimestamp = (new Date()).getTime();
        const fileName = `${name}-${currentTimestamp}.csv`;
        saveAs(blob, fileName);
    };
    return handleClick;
}

export default useDownloading;
