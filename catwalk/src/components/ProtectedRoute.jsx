import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

/**
 * Prevents users from accessing other pages. If the user is not logged in,
 * they will be redirected to the login page.
 *
 * @returns The children if logged in, otherwise redirects to /LogIn
 */
export default function ProtectedRoute({ children }) {
    const { isLoggedIn, isLoading } = useAuth();

    // Show nothing while checking auth state
    if (isLoading) {
        return null;
    }

    if (!isLoggedIn) {
        return <Navigate to="/LogIn" replace />;
    }

    return children;
}


