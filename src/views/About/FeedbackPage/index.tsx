import React, { useState, useCallback, useMemo } from 'react';

import TextInput from '#components/TextInput';
import Button from '#components/Button';
import TextAreaInput from '#components/TextAreaInput';
import SelectInput from '#components/SelectInput';

import { apiEndPoint } from '#utils/constants';

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
    const [selectedAttachment, setSelectedAttachment] = useState<File>();
    const [attachmentKey, setAttachmentKey] = useState<string>(new Date().toTimeString());
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

    const disabled = useMemo(
        () => !name && !email && !type && !subject && !feedback && !selectedAttachment,
        [
            name,
            email,
            type,
            subject,
            feedback,
            selectedAttachment,
        ],
    );
    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e?.target.files) {
                return undefined;
            }
            const file = e.target.files[0];
            return setSelectedAttachment(file);
        },
        [setSelectedAttachment],
    );
    console.log({ feedback });

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            const formData = new FormData();
            if (selectedAttachment) {
                formData.append('attachment', selectedAttachment);
            }
            formData.append('name', name);
            formData.append('email', email);
            if (type) {
                formData.append('type', type);
            }
            formData.append('subject', subject);
            formData.append('your_feedback', feedback);
            try {
                const response = await fetch(`${apiEndPoint}/core/feedbackform`, {
                    method: 'POST',
                    body: formData,
                });
                if (response.status !== 200) {
                    const jsonResponse = await response.json();
                    if (jsonResponse.error === 1) {
                        setError(jsonResponse.message);
                    }
                } else {
                    setName('');
                    setEmail('');
                    setType(undefined);
                    setSubject('');
                    setFeedback('');
                    setSelectedAttachment(undefined);
                    setError('');
                    setAttachmentKey(new Date().toTimeString());
                }
            } catch (err) {
                setError(err.message);
            }
        },
        [
            selectedAttachment,
            email,
            feedback,
            name,
            subject,
            type,
            setName,
            setEmail,
            setType,
            setSubject,
            setFeedback,
            setSelectedAttachment,
            setError,
        ],
    );

    const attachedFileName = useMemo(() => {
        if (selectedAttachment) {
            return selectedAttachment.name;
        }
        return null;
    }, [selectedAttachment]);

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
                    <div className={styles.error}>
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
                <div className={styles.attachment}>
                    <div
                        className={styles.label}
                    >
                        Add an attachment
                    </div>
                    <input
                        id="attachment"
                        type="file"
                        name="attachment"
                        onChange={handleFileInput}
                        key={attachmentKey}
                    />
                </div>
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
                    disabled={!!error || disabled}
                    type="submit"
                >
                    Send
                </Button>
            </form>
        </div>
    );
}
export default FeedbackPage;
