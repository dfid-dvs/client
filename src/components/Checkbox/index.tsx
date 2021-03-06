import React, { useMemo, useCallback } from 'react';
import {
    MdCheckBox,
    MdCheckBoxOutlineBlank,
    MdIndeterminateCheckBox,
} from 'react-icons/md';
import {
    randomString,
    _cs,
} from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
    labelClassName?: string;
    checkIconClassName?: string;

    disabled?: boolean;
    value: boolean;
    onChange: (value: boolean) => void;
    label?: string | number;
    tooltip?: string;
    readOnly?: boolean;

    // NOTE: if value is false and indeterminate is true, show a filled checkbox
    indeterminate?: boolean;
}

const Checkbox = (props: Props) => {
    const {
        label,
        tooltip,
        className: classNameFromProps,
        value,
        disabled,
        readOnly,
        onChange,
        checkIconClassName,
        labelClassName: labelClassNameFromProps,
        indeterminate,
        ...otherProps
    } = props;

    const inputId = useMemo(
        () => randomString(16),
        [],
    );

    const handleChange = useCallback(
        (e) => {
            const v = e.target.checked;
            onChange(v);
        },
        [onChange],
    );

    const className = _cs(
        styles.checkbox,
        'checkbox',
        classNameFromProps,
        (value || indeterminate) && styles.checked,
        (value || indeterminate) && 'checked',
        disabled && styles.disabled,
        disabled && 'disabled',
        readOnly && styles.readOnly,
        readOnly && 'read-only',
    );

    const iconClassName = _cs(
        styles.checkmark,
        'checkmark',
        checkIconClassName,
    );

    const inputClassName = _cs(
        'input',
        styles.input,
    );

    const labelClassName = _cs(
        'label',
        styles.label,
        labelClassNameFromProps,
    );

    return (
        <label
            htmlFor={inputId}
            className={className}
            title={tooltip}
        >
            {value && (
                <MdCheckBox
                    className={iconClassName}
                />
            )}
            {!value && indeterminate && (
                <MdIndeterminateCheckBox
                    className={iconClassName}
                />
            )}
            {!value && !indeterminate && (
                <MdCheckBoxOutlineBlank
                    className={iconClassName}
                />
            )}
            <input
                id={inputId}
                onChange={handleChange}
                className={inputClassName}
                type="checkbox"
                checked={value}
                disabled={disabled || readOnly}
                {...otherProps}
            />
            <div className={labelClassName}>
                { label }
            </div>
        </label>
    );
};

Checkbox.defaultProps = {
    disabled: false,
    readOnly: false,
    value: false,
};

export default Checkbox;
