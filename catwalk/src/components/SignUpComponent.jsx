import { useState, useRef } from 'react'; //TODO clean up imports
import { useNavigate } from 'react-router-dom'; // get to home page if creation success
import TransparentButton from './TransparentButton';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function SignUp() {
    const navigate = useNavigate(); //navigation
    const [username, setUserName] = useState(""); // username state
    const [email, setEmail] = useState(""); // email state
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [password, setPassword] = useState(""); // password state
    const [confirmPassword, setConfirmPassword] = useState(""); // confirmPassword state
    const [error, setError] = useState(''); // error state
    

    // Used for form navigation, TODO potentially move this and form into own component
    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);

    const handleKeyDown = (event, nextInputRef) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            nextInputRef.current?.focus();
        }
    };

    // Used to ensure valid email is entered TODO - make better email validation?
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setIsEmailValid(e.target.validity.valid);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        console.log(username);
        console.log(password);

        //removing for now and letting firebase handle it
        /* if (!validateEmail(email)) {
            setError("Account Creation Unsuccessful: Bad Email");
            return;
        } */

        if (!validatePasswordMatch(password, confirmPassword)) {
            setError("Passwords do not match.");
            return;
        }

        if (!validatePassword(username, password)){
            setError("Password does not meet requirements.")
            return;
        }

        try {
            //make firebase account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Firebase signup succeeded");
            console.log("Firebase UID:", userCredential.user.uid, "Email:", userCredential.user.email);

            // get token from firebase
            const token = await userCredential.user.getIdToken();
            console.log("Firebase token exists:", !!token);

            // make pg and neo users to match
            const res = await fetch("http://localhost:3000/users/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: username,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                const error = new Error(data.error);
                error.code = data.errorCode;
                throw error;
            }

            console.log("Account Creation Successful:", data);
            setError("");
            navigate("/Home");
        } catch (err) {
            console.log("Firebase/signup error code:", err.code);
            console.log("Firebase/signup error message:", err.message);
            switch (err.code) {
                case 1:
                    setError("Account Creation Unsuccessful: Email taken.");
                    break;
                case 2:
                    setError("Account Creation Unsuccessful: Username taken.");
                    break;
                case "auth/email-already-in-use":
                    setError("Account Creation Unsuccessful: Email taken.");
                    break;
                case "auth/weak-password":
                    setError("Account Creation Unsuccessful: Weak password.");
                    break;
                case "auth/invalid-email":
                    setError("Account Creation Unsuccessful: Invalid email.");
                    break;
                default:
                    setError("Account Creation Unsuccessful.");
                    break;
            }

            console.error("Account Creation Unsuccessful:", err.message);
        }
        /* e.preventDefault();
        if(!isEmailValid)
        {
            setError("Account Creation Unsuccessful: Invalid Email")
            return;
        }
        if (!validatePasswordMatch(password, confirmPassword)) {
            setError('Passwords do not match.');
            return;
        }
        if (!validatePassword(password))
        {
            setError('Password does not meet requirements.')
            return;
        }
        await fetch('http://localhost:3000/users/signup', {
            method: 'POST', // Specify the HTTP method as POST
            headers: {
                'Content-Type': 'application/json', // Indicate the data format
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        }).then(async (res) => {
            const data = await res.json(); // extract JSON body

            if (!res.ok) {
                const error = new Error(data.error);   // throw with message from backend
                error.code = data.errorCode;
                throw error;
            }
            return data; // successful response
        })
        .then((data) => {
            console.log('Account Creation Successful: ', data);
            setError(''); // Clear any previous errors
            navigate('/Home');
        })
        .catch((err) => {
            switch (err.code) {
                case 1:
                    setError("Account Creation Unsuccessful: Email taken.");
                    break;
                case 2:
                    setError("Account Creation Unsuccessful: Username taken.");
                    break;
                default:
                    break;
            }
            console.error('Account Creation Unsuccessful: ', err.message); // access error message here
            // Optionally set to state to display in UI
        }); */
    };

    return (
        <form style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        }}>
            <input type="text" placeholder="Username"
                value={username}
                ref={null}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, input1Ref)}>
            </input>
            <input type="email" placeholder="Email Address"
                value={email}
                ref={input1Ref}
                onChange={handleEmailChange}
                onKeyDown={(e) => handleKeyDown(e, input2Ref)}>
            </input>
            <input type="password" placeholder="Password"
                value={password}
                ref={input2Ref}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, input3Ref)}>
            </input>
            <input type="password" placeholder="Confirm Password"
                value={confirmPassword}
                ref={input3Ref}
                onChange={(e) => setConfirmPassword(e.target.value)}>
            </input>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            <p className='transparent-text-small'>Password must:</p>
                <ul style={{margin: 0}}>
                <li className='transparent-text-small'>Be at least 8 characters long</li>
                <li className='transparent-text-small'>Be no more than 24 characters long</li>
                <li className='transparent-text-small'>Include at least one letter</li>
                <li className='transparent-text-small'>Include at least one number</li>
                <li className='transparent-text-small'>Not contain your username or email</li>
                </ul>
            <TransparentButton type="button" onClick={handleSignUp}>Create Account</TransparentButton>
        </form>
    )
}

function validatePasswordMatch(password, confirmPassword) {
    return password == confirmPassword;
}

function validatePassword(username, password) {
    if (password.length < 8) {
        return false;
    }

    if (password.length > 24) {
        return false;
    }

    if (!/[A-Za-z]/.test(password)) {
        return false;
    }

    if (!/[0-9]/.test(password)) {
        return false;
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        return false;
    }

    return true;
}

function validateEmail(email)
{
    if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/.test(email)){
        return false;
    }
    return true;
}
