import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AccountLogInPage from './pages/AccountLogInPage';
import AccountSignUpPage from './pages/AccountSignUpPage';
import ProfilePage from './pages/ProfilePage';
import FirebaseLoginPage from './pages/FirebaseLoginPage';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * App Component
 *
 * This is the main application component that sets up the routing for the application
 * using `react-router-dom`. It defines the routes for the home page, login page, and
 * sign-up page.
 *
 * Routes:
 * - `/` and '/Home': Renders the HomePage component.
 * - `/LogIn`: Renders the AccountLogInPage component.
 * - `/SignUp`: Renders the `AccountSignUpPage` component.
 *
 * @returns The rendered application with routing.
 */

function App() {
    return (
        <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/Home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/LogIn" element={<AccountLogInPage />} />
            <Route path="/SignUp" element={<AccountSignUpPage />} />
            <Route path="/Profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/Profile/:profileID" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/FireLogin" element={<FirebaseLoginPage />} />
        </Routes>
    );
}

    export default App;