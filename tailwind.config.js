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
            animation: {
                fadeIn: 'fadeIn 0.8s ease-in',
                fadeInUp: 'fadeInUp 0.8s ease',
                bounceIn: 'bounceIn 0.9s ease',
                slideInRight: 'slideInRight 1s ease-out',
                slideInLeft: 'slideInLeft 1s ease-out',
                slideInUp: 'slideInUp 1s ease-out',
                pulse: 'pulse 1.5s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                bounceIn: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '60%': { transform: 'scale(1.1)', opacity: '1' },
                    '100%': { transform: 'scale(1)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulse: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
            },
            boxShadow: {
                sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/backdrop-blur'),
    ],
}