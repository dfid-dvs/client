import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { InputChangeEvent } from '#types';
import Option from './Option';
import styles from './styles.css';

interface Props<T = {}> {
    className?: string;
    options?: T[];
    optionKeySelector?: (d: T) => string;
    optionLabelSelector?: (d: T) => string;
    renderer?: React.ReactNode;
    label?: React.ReactNode;
    value?: T;
    onChange?: (e: InputChangeEvent) => void;
    name?: string;
}


const SegmentInput = (props: Props) => {
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
                    const key = optionKeySelector ? optionKeySelector(option) : undefined;
                    const isActive = key === value;
                    let RenderOption = Option;

                    if (renderer) {
                        RenderOption = renderer;
                    }

                    const optionLabel = optionLabelSelector
                        ? optionLabelSelector(option)
                        : undefined;

                    return (
                        <RenderOption
                            key={key}
                            onClick={onChange ? (() => onChange({ name, value: key })) : undefined}
                            isActive={isActive}
                            label={optionLabel}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SegmentInput;
