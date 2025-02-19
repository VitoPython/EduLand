import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <div className="mt-8">
                    <SignIn 
                        routing="path" 
                        path="/sign-in" 
                        signUpUrl="/sign-up"
                        appearance={{
                            elements: {
                                rootBox: "mx-auto",
                                card: "shadow-none",
                                footer: "hidden"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SignInPage; 