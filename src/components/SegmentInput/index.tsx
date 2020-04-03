import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Option from './Option';
import styles from './styles.css';

interface Props<T, V> {
    className?: string;
    options?: T[];
    optionKeySelector: (d: T) => V;
    optionLabelSelector: (d: T) => string;
    renderer?: typeof Option;
    // renderer?: React.ReactNode;
    label?: React.ReactNode;
    value?: V;
    onChange?: (value: V, name: string | undefined) => void;
    name?: string;
}


function SegmentInput<T, V>(props: Props<T, V>) {
    const {
        className,
        options = [],
        optionKeySelector,
        optionLabelSelector,
        renderer,
        label,
        value,
        onChange,
        name,
    } = props;

    return (
        <div className={_cs(className, styles.segmentInput)}>
            <div className={styles.inputLabel}>
                { label }
            </div>
            <div className={styles.inputContainer}>
                { options.map((option) => {
                    const key = optionKeySelector(option);
                    const isActive = key === value;

                    const RenderOption = renderer || Option;

                    const optionLabel = optionLabelSelector
                        ? optionLabelSelector(option)
                        : undefined;

                    return (
                        <RenderOption
                            key={key}
                            onClick={onChange ? (() => onChange(key, name)) : undefined}
                            isActive={isActive}
                            label={optionLabel}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default SegmentInput;
