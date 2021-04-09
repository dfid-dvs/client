import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Range } from 'rc-slider';
import { MdPlayArrow, MdRefresh } from 'react-icons/md';

import InputLabel from '#components/InputLabel';

import styles from './styles.css';
import Button from '#components/Button';
import useBasicToggle from '#hooks/useBasicToggle';

interface DateRangeProps {
    className?: string;
    startDate?: string;
    setStartDate?: React.Dispatch<React.SetStateAction<string>>;
    endDate?: string;
    setEndDate?: React.Dispatch<React.SetStateAction<string>>;
    defaultStartDate: string;
    defaultEndDate: string;
}

const minYear = 2012;
const maxYear = new Date().getFullYear() + 5;

const marks = {
    2012: '2012',
    2013: '2013',
    2014: '2014',
    2015: '2015',
    2016: '2016',
    2017: '2017',
    2018: '2018',
    2019: '2019',
    2020: '2020',
    2021: '2021',
    2022: '2022',
    2023: '2023',
    2024: '2024',
    2025: '2025',
    2026: '2026',
};

function DateRangeSelector(props: DateRangeProps) {
    const {
        className,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        defaultStartDate,
        defaultEndDate,
    } = props;

    const defaultYears = useMemo(
        () => {
            const convStartDate = new Date(defaultStartDate).getFullYear();
            const convEndDate = new Date(defaultEndDate).getFullYear();
            return [convStartDate, convEndDate];
        },
        [defaultStartDate, defaultEndDate],
    );
    const selectedSliderDateRange = useMemo(() => {
        const convStartDate = new Date(defaultStartDate).getFullYear();
        const convEndDate = new Date(defaultEndDate).getFullYear();
        const defYear = [convStartDate, convEndDate];
        if (startDate) {
            defYear[0] = new Date(startDate).getFullYear();
            if (endDate) {
                defYear[0] = new Date(startDate).getFullYear();
                defYear[1] = new Date(endDate).getFullYear();
            }
        }
        return defYear;
    }, [startDate, endDate, defaultStartDate, defaultEndDate]);

    const [sliderDateRange, setSliderDateRange] = useState(selectedSliderDateRange);

    const handleStartDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e || !setStartDate) {
                return;
            }
            setStartDate(e.target.value);
            const tmpDateRange = [...sliderDateRange];
            tmpDateRange[0] = new Date(e.target.value).getFullYear();
            setSliderDateRange(tmpDateRange);
        },
        [setStartDate, sliderDateRange, setSliderDateRange],
    );
    const handleEndDateChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e || !setEndDate) {
                return;
            }
            setEndDate(e.target.value);
            const tmpDateRange = [...sliderDateRange];
            tmpDateRange[1] = new Date(e.target.value).getFullYear();
            setSliderDateRange(tmpDateRange);
        },
        [setEndDate, sliderDateRange],
    );

    const [dateRangeShown, , , toggleDateRange] = useBasicToggle();

    const handleClearDates = useCallback(
        () => {
            if (setStartDate && setEndDate) {
                setStartDate(defaultStartDate);
                setEndDate(defaultEndDate);
            }
            setSliderDateRange(defaultYears);
        },
        [
            defaultYears,
            setStartDate,
            setEndDate,
            setSliderDateRange,
            defaultEndDate,
            defaultStartDate,
        ],
    );

    const onHandleSliderChange = useCallback(
        (value) => {
            setSliderDateRange(value);
            if (setStartDate && setEndDate) {
                setStartDate(new Date(String(value[0])).toISOString().slice(0, 10));
                setEndDate(new Date(String(value[1])).toISOString().slice(0, 10));
            }
        },
        [setSliderDateRange, setStartDate, setEndDate],
    );

    return (
        <div
            className={_cs(
                styles.container,
                className,
                dateRangeShown && styles.calendarContainer,
            )}
            style={{
                width: (maxYear - minYear) * 35,
            }}
        >
            {dateRangeShown && (
                <div className={styles.calendars}>
                    <div className={styles.dateContainer}>
                        <InputLabel
                            className={styles.label}
                        >
                            From
                        </InputLabel>
                        <input
                            type="date"
                            id="startDate"
                            name="start-date"
                            value={startDate}
                            min="2010-01-01"
                            max="2021-12-31"
                            onChange={handleStartDateChange}
                            className={styles.dateInput}
                        />
                    </div>
                    <div className={styles.dateContainer}>
                        <InputLabel
                            className={styles.label}
                        >
                            To
                        </InputLabel>
                        <input
                            type="date"
                            id="endDate"
                            name="end-date"
                            value={endDate}
                            min={startDate}
                            max="2021-12-31"
                            onChange={handleEndDateChange}
                            className={styles.dateInput}
                        />
                    </div>
                    <Button
                        className={styles.clearButton}
                        onClick={handleClearDates}
                        variant="icon"
                        icons={<MdRefresh />}
                        title="Clear Dates"
                        transparent
                    >
                        Reset
                    </Button>
                </div>
            )}
            <div
                className={_cs(
                    styles.slider,
                )}
            >
                <div
                    className={_cs(
                        styles.row,
                        !dateRangeShown && styles.noDateRange,
                    )}
                >
                    <Button
                        onClick={toggleDateRange}
                        variant="icon"
                        icons={(
                            <MdPlayArrow
                                className={_cs(
                                    styles.icon,
                                    dateRangeShown && styles.rotate,
                                )}

                            />
                        )}
                        title={dateRangeShown ? 'Hide Date Range' : 'Show Date Range'}
                        transparent
                    />
                    <Range
                        marks={marks}
                        onChange={onHandleSliderChange}
                        value={sliderDateRange}
                        min={minYear}
                        max={maxYear}
                        allowCross={false}
                        draggableTrack
                        className={styles.range}
                    />
                </div>
            </div>
        </div>
    );
}

export default DateRangeSelector;
