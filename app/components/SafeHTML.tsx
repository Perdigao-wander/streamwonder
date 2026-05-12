'use client';

import React from 'react';

interface SafeHTMLProps {
    html: string;
    className?: string;
    asPlainText?: boolean;
}

const SafeHTML = ({ html, className = '', asPlainText = false }: SafeHTMLProps) => {
    if (!html) return null;

    if (asPlainText) {
        // Remove tags HTML e exibe como texto puro
        const plainText = html.replace(/<[^>]*>/g, '');
        return <p className={className}>{plainText}</p>;
    }

    // Remove scripts e iframes perigosos
    const safeHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    return (
        <div
            className={`prose prose-invert prose-sm max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
};

export default SafeHTML;