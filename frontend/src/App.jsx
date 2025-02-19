import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {  SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";    
import HomePost from './pages/home';
import StudentRegistration from './pages/StudentRegistration';
import Profile from './pages/Profile';
import Header from './components/Header';
import { useEffect } from 'react';
import { setupInterceptors } from './api/api';
import { useAuth } from "@clerk/clerk-react";
import SignInPage from './pages/SignInPage';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Lessons from './pages/Lessons';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';

function App() {
    const { getToken, session, isLoaded } = useAuth();

    useEffect(() => {
        setupInterceptors(getToken, session);
    }, [getToken, session]);

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen">
                <Header />
                <main className="py-10">
                    <Routes>
                        <Route path="/" element={<HomePost />} />
                        <Route path="/post" element={<HomePost />} />
                        
                        {/* Защищенные маршруты */}
                        
                        
                        <Route
                            path="/profile"
                            element={
                                <>
                                    <SignedIn>
                                        <Profile />
                                    </SignedIn>
                                    <SignedOut>
                                        <RedirectToSignIn />
                                    </SignedOut>
                                </>
                            }
                        />

                        <Route path="/register" element={<StudentRegistration />} />
                        <Route
                            path="/sign-in/*"
                            element={
                                <SignedOut>
                                    <SignInPage />
                                </SignedOut>
                            }
                        />

                        <Route
                            path="/students"
                            element={
                                <>
                                    <SignedIn>
                                        <Students />
                                    </SignedIn>
                                    <SignedOut>
                                        <RedirectToSignIn />
                                    </SignedOut>
                                </>
                            }
                        />

                        <Route
                            path="/courses"
                            element={
                                <>
                                    <SignedIn>
                                        <Courses />
                                    </SignedIn>
                                    <SignedOut>
                                        <RedirectToSignIn />
                                    </SignedOut>
                                </>
                            }
                        />

                        <Route
                            path="/courses/:courseId/lessons"
                            element={
                                <>
                                    <SignedIn>
                                        <Lessons />
                                    </SignedIn>
                                    <SignedOut>
                                        <RedirectToSignIn />
                                    </SignedOut>
                                </>
                            }
                        />

                        <Route
                            path="/courses/:courseId/lessons/:lessonId/assignments/:assignmentId"
                            element={
                                <>
                                    <SignedIn>
                                        <AssignmentDetail />
                                    </SignedIn>
                                    <SignedOut>
                                        <RedirectToSignIn />
                                    </SignedOut>
                                </>
                            }
                        />

                        <Route
                            path="/courses/:courseId/lessons/:lessonId/assignments"
                            element={
                                <>
                                    <SignedIn>
                                        <Assignments />
                                    </SignedIn>
                                    <SignedOut>
                                        <RedirectToSignIn />
                                    </SignedOut>
                                </>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
