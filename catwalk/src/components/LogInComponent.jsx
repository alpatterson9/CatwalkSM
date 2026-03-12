import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // get to home page if creation success
import TransparentButton from './TransparentButton';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

// Import for user auth and persistence
import { useAuth } from "../AuthContext"

export default function Login() 
{
    const { login } = useAuth();
    const navigate = useNavigate(); //navigation
    const [email, setEmail] = useState(""); // email state
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [password, setPassword] = useState(""); // password state
    const [error, setError] = useState(''); // error state

    // Used for form navigation, TODO potentially move this and form into own component
    const input1Ref = useRef(null);
    const input2Ref = useRef(null);

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

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!isEmailValid) {
            setError("Invalid email.");
            return;
        }

        try {
            // 1) Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // 2) Get Firebase ID token
            const token = await userCredential.user.getIdToken();

            // 3) Rehydrate local app identity through your existing /users/me route
            const res = await fetch("http://localhost:3000/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                const error = new Error(data.error);
                throw error;
            }

            // 4) Keep AuthContext shape the same
            login({
                user: data.user,
                accessToken: token,
                userID: data.userID,
            });

            setError("");
            navigate("/Home");
        } catch (err) {
            setError("Incorrect Email or Password, please try again.");
            console.error("Error: Bad Login", err.message);
        }
        /* e.preventDefault();

        await fetch('http://localhost:3000/users/login', {
            method: 'POST', // Specify the HTTP method as POST
            headers: {
                'Content-Type': 'application/json', // Indicate the data format
            },
            credentials: "include",
            body: JSON.stringify({
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
            console.log('Login Successful: ', data);
            console.log("Data from login response: ");
            console.log(data);
            login({ user: data.user, accessToken: data.token, userID: data.userID});
            setError(''); // Clear any previous errors
            navigate('/Home');
        })
        .catch((err) => {
            setError("Incorrect Email or Password, please try again.");
            console.error('Error: Bad Login');
        }); */
    };

    return (
        <form style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        }}>
            <input type="email" placeholder="Email Address"
                value={email}
                ref={input1Ref}
                onChange={handleEmailChange}
                onKeyDown={(e) => handleKeyDown(e, input2Ref)}>
            </input>
            <input type="password" placeholder="Password"
                value={password}
                ref={input2Ref}
                onChange={(e) => setPassword(e.target.value)}>
            </input>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            <TransparentButton type="button" onClick={handleLogin}>Log In</TransparentButton>
        </form>
    )
}