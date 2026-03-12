import Toolbar from '../components/Toolbar'
import { Link } from 'react-router-dom';
import SignUp from '../components/SignUpComponent';

/**
 * AccountSignUpPage Component
 *
 * This component renders the sign-up page for the application. It includes a toolbar,
 * input fields for username, email, password, and password confirmation, and a button
 * to create an account.
 *
 * Navigation:
 * - Clicking the "Catwalk" text in the toolbar navigates to the home page (`/`).
 * - Clicking the "Create Account" button navigates to the `/Home` page.
 *
 * @returns The rendered sign-up page.
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
                <p className='transparent-text'>Sign Up</p>
                <SignUp />
            </div>
        </div>
    </div>)
}

export default AccountSignUpPage