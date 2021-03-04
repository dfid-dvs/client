import React, { useState, useCallback } from 'react';

import TextInput from '#components/TextInput';
import Button from '#components/Button';
import TextAreaInput from '#components/TextAreaInput';
import SelectInput from '#components/SelectInput';

import styles from './styles.css';

interface TypeOption {
    key: string;
    title: string;
}
const typeOptions: TypeOption[] = [
    { key: 'general-feedback', title: 'General Feedback' },
    { key: 'data-issue', title: 'Data Issue' },
    { key: 'functionality-issue', title: 'Functionality Issue' },
    { key: 'design-issue', title: 'Design Issue' },
    { key: 'others', title: 'Others' },
];

const typeKeySelector = (item: TypeOption) => item.key;
const typeLabelSelector = (item: TypeOption) => item.title;

function FeedbackPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState<TypeOption['key']>();
    const [subject, setSubject] = useState('');
    const [feedback, setFeedback] = useState('');

    const [error, setError] = useState('');

    const title = 'Feedback Form';
    const subTitle = 'Welcome! What kind of feedback do you have about this tool?';

    const handleNameChange = useCallback(
        (value: string) => {
            setError('');
            setName(value);
        },
        [setName],
    );

    const handleEmailChange = useCallback(
        (value: string) => {
            setError('');
            setEmail(value);
        },
        [setEmail],
    );

    const handleTypeChange = useCallback(
        (value?: string) => {
            setError('');
            setType(value);
        },
        [setType],
    );

    const handleSubjectChange = useCallback(
        (value: string) => {
            setError('');
            setSubject(value);
        },
        [setSubject],
    );

    const handleFeedbackChange = useCallback(
        (value: string) => {
            setError('');
            setFeedback(value);
        },
        [setFeedback],
    );

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            // TODO: connect with API
            console.warn('feedback submitted');
        },
        [],
    );

    return (
        <div className={styles.container}>
            <div className={styles.firstSection}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.subTitle}>
                    {subTitle}
                </div>
            </div>
            <form
                className={styles.formSection}
                onSubmit={handleSubmit}
            >
                {error && (
                    <div>
                        {error}
                    </div>
                )}
                <TextInput
                    label="Name"
                    placeholder="Your name"
                    autoFocus
                    value={name}
                    onChange={handleNameChange}
                    className={styles.textInput}
                    inputClassName={styles.input}
                    labelClassName={styles.label}
                />
                <TextInput
                    label="Email"
                    placeholder="Your email address"
                    type="email"
                    autoFocus
                    value={email}
                    onChange={handleEmailChange}
                    className={styles.textInput}
                    inputClassName={styles.input}
                    labelClassName={styles.label}
                />
                <SelectInput
                    label="Type"
                    placeholder="Choose one"
                    className={styles.selectInput}
                    options={typeOptions}
                    onChange={handleTypeChange}
                    value={type}
                    optionLabelSelector={typeLabelSelector}
                    optionKeySelector={typeKeySelector}
                    labelClassName={styles.label}
                    inputClassName={styles.input}
                    showDropDownIcon
                />
                <TextInput
                    label="Subject"
                    placeholder="Subject"
                    autoFocus
                    value={subject}
                    onChange={handleSubjectChange}
                    className={styles.textInput}
                    inputClassName={styles.input}
                    labelClassName={styles.label}
                />
                <TextAreaInput
                    label="Your Feedback"
                    placeholder="Write us your feedback..."
                    autoFocus
                    value={feedback}
                    onChange={handleFeedbackChange}
                    className={styles.textInput}
                    inputClassName={styles.textAreaInput}
                    labelClassName={styles.label}
                />
                <Button
                    className={styles.button}
                    disabled={!!error}
                    type="submit"
                >
                    Send
                </Button>
            </form>
        </div>
    );
}
export default FeedbackPage;
