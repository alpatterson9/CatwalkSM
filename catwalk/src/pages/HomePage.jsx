import Toolbar from '../components/Toolbar';
import { Link, useNavigate } from 'react-router-dom';
import TransparentButton from '../components/TransparentButton';
import PostComponent from '../components/PostComponent';
import SearchBar from '../components/SearchBar';
import "../firebase";

// Import for user auth and persistence
import { useAuth } from "../AuthContext"
import { useState, useEffect } from 'react';


/**
 * HomePage Component
 *
 * This component renders the home page of the application. It includes a toolbar
 * with navigation links to the sign-up and login pages, as well as a title for the application.
 *
 * Navigation:
 * - Clicking the "Sign Up" button navigates to the `/SignUp` page.
 * - Clicking the "Log In" button navigates to the `/LogIn` page.
 *
 * @returns The rendered home page.
 */
function HomePage() {
    const { isLoggedIn, userID, logout } = useAuth();
    const [postIds, setPostIds] = useState([]);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate(); //navigation

    const handleLogOut = async () => {
        await logout();
        navigate('/LogIn');
    };

    const goToProfile = async (e) => {
        e.preventDefault();
        navigate(`/Profile/${userID}`);
    }

    const handleDeletePost = (postID) => {
        setPosts(posts.filter(post => post.postID !== postID));
    };

    /**
     * gets IDs of all posts currently stored in mongo
     * @param {*} e 
     */
    const getAllPostIds = async (e) => {
        await fetch('http://localhost:3000/posts/getAllPostIds', {
            method: 'GET'
        }).then(async (res) => {
            const data = await res.json(); // extract JSON body

            if (!res.ok) {
                const error = new Error(data.error);
                error.code = data.errorCode;
                throw error;
            }
            return data; // successful response
        })
        .then((data) => {
            //On Success set use state to contain all post IDs
            setPostIds(data);
        })
        .catch((err) => {
            // error
        });
    }

    //on render get IDs of all posts
    useEffect(() => {
            getAllPostIds();
        }, []);

    //when postIds gets updated, fetch and store data for all posts
    useEffect(() => {
        if (postIds.length == 0) return;

        const fetchPosts = async () => {
            const allPosts = [];
            for(const id of postIds) {
                const res = await fetch(`http://localhost:3000/posts/${id}`);
                const data = await res.json();
                allPosts.push(data);
            }
            setPosts(allPosts);
        }

        fetchPosts();
    }, [postIds]);

    return (
        <div style={{ minHeight: '100vh' }}>
            <Toolbar>
                {isLoggedIn ? (
                    <>
                        <TransparentButton onClick={goToProfile}>Profile</TransparentButton>
                        <TransparentButton onClick={handleLogOut}>Log Out</TransparentButton>
                        <span className="transparent-text">Catwalk</span>
                    </>) : (
                        <><Link to="/SignUp">
                            <TransparentButton>Sign Up</TransparentButton>
                        </Link>
                        <Link to="/LogIn">
                            <TransparentButton>Log In</TransparentButton>
                        </Link>
                        <span className="transparent-text">Catwalk</span></>)}
                        <SearchBar/>
                        <Link to="/FireLogin">
                            <TransparentButton>Firebase Login</TransparentButton>
                        </Link>
            </Toolbar>
            <div>
                {posts.map(post => (//uses map to create a PostComponent for
                                //each post currently stored
                    <PostComponent key={post.postID} post={post} onDelete={handleDeletePost}/>
                ))}
            </div>
        </div>
        
    )
}

export default HomePage