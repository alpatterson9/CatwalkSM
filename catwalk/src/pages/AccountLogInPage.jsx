import Toolbar from '../components/Toolbar';
import { Link } from 'react-router-dom';
import Login from '../components/LogInComponent';

import { useEffect } from "react";
import { ui, uiConfig } from "../firebaseui";


//firebase UI, might use later if we want altenrative sign up options (google etc.)
/* export default function AccountLoginPage() {
  useEffect(() => {
    ui.start("#firebaseui-auth-container", uiConfig);
    return () => ui.reset();
  }, []);

  return <div id="firebaseui-auth-container" />;
} */

/**
 * AccountLogInPage Component
 *
 * This component renders the login page for the application. It includes a toolbar,
 * input fields for username and password, and a login button.
 *
 * Navigation:
 * - Clicking the "Catwalk" text in the toolbar navigates to the home page (`/`).
 * - Clicking the "Log In" button navigates to the `/Home` page.
 *
 * @returns The rendered login page.
 */

function AccountSignUpPage() {
    return (<div>
        <Toolbar>
            <Link to="/">
                <span className="transparent-text">Catwalk</span>
            </Link>
        </Toolbar>
        <div className='parent-container'>
            <div className='accountCreationDiv'>
                <p className='transparent-text'>Login</p>
                <Login />
                <p style={{ marginTop: '15px', color: 'white' }}>
                    Don't have an account?{' '}
                    <Link to="/SignUp" style={{ color: '#a78bfa', textDecoration: 'underline' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    </div>)
}

export default AccountSignUpPage