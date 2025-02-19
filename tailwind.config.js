module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: '#333',
                        h1: {
                            color: '#1a202c',
                            fontWeight: '700',
                            fontSize: '1.875rem',
                            marginTop: '1.5rem',
                            marginBottom: '1rem',
                        },
                        h2: {
                            color: '#1a202c',
                            fontWeight: '600',
                            fontSize: '1.5rem',
                            marginTop: '1.5rem',
                            marginBottom: '1rem',
                        },
                        p: {
                            marginTop: '0.75rem',
                            marginBottom: '0.75rem',
                        },
                        pre: {
                            backgroundColor: '#1a202c',
                            color: '#e5e7eb',
                            fontSize: '0.875rem',
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            marginTop: '1rem',
                            marginBottom: '1rem',
                        },
                        code: {
                            color: '#e5e7eb',
                            backgroundColor: 'transparent',
                            padding: '0',
                            fontSize: '0.875rem',
                            fontFamily: 'ui-monospace, monospace',
                        },
                        'ul > li': {
                            position: 'relative',
                            paddingLeft: '1.5em',
                        },
                        'ul > li::before': {
                            content: '"•"',
                            position: 'absolute',
                            left: '0.25em',
                            color: '#4F46E5',
                        },
                        'ol > li': {
                            position: 'relative',
                            paddingLeft: '1.5em',
                        },
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
} 