import React from 'react';

interface FooterProps {
    className?: string;
}
export default function Footer(props: FooterProps) {
    const {
        className,
    } = props;

    const footerText = '© DVS Nepal 2021, All rights reserved.';
    return (
        <div className={className}>
            {footerText}
        </div>
    );
}
