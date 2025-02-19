import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

const clerkPubKey = import.meta.env.VITE_CLERK_FRONTEND_API;

if (!clerkPubKey) {
    throw new Error("Missing Clerk Publishable Key");
}

const appearance = {
    layout: {
        socialButtonsPlacement: "bottom",
        socialButtonsVariant: "blockButton",
        termsPageUrl: "https://clerk.com/terms"
    },
    elements: {
        formButtonPrimary: 
            "bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        formFieldInput: 
            "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
        card: 
            "bg-white shadow-none sm:mx-auto sm:w-full sm:max-w-md",
        headerTitle: 
            "text-center text-3xl font-extrabold text-gray-900",
        headerSubtitle: 
            "text-center text-sm text-gray-600",
        socialButtonsBlockButton: 
            "inline-flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 mt-2"
    }
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ClerkProvider 
            publishableKey={clerkPubKey}
            navigate={(to) => window.location.href = to}
            appearance={appearance}
        >
            <App />
        </ClerkProvider>
    </StrictMode>,
)
