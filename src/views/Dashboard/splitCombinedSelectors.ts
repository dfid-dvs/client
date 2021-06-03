import { findDifferenceInList } from '@togglecorp/fujs';

const splitCombinedSelectors = (options: string[], subKey: string) => {
    const key = subKey.replace('sub', '');
    const optionsWithSubKeys = options.filter(m => m.includes(subKey));
    const optionsWithoutSubKeys = findDifferenceInList(
        options,
        optionsWithSubKeys,
        opt => opt,
    ).removed;

    const optionsIdsWithoutSubKeys = optionsWithoutSubKeys.length > 0 ? optionsWithoutSubKeys.map(
        opt => opt.replace(`${key}-`, ''),
    ) : undefined;
    const optionIdsWithSubKeys = optionsWithSubKeys.length > 0 ? optionsWithSubKeys.map(
        opt => opt.replace(`${subKey}-`, ''),
    ) : undefined;

    return [optionsIdsWithoutSubKeys, optionIdsWithSubKeys];
};

export default splitCombinedSelectors;
