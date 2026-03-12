/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This Component is used to display a user profile
 */
import { updateProfile } from '../functions/profileFunctions';
import {
    createPost,
    getUserPostIds as fetchUserPostIds,
    getPostById
} from '../functions/postFunctions';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // get to home page if creation success
//import Toolbar from '../components/Toolbar';
//import Popup from '../components/Popup';
//import CreatePostPopup from '../components/CreatePostPopup';
//import { Link } from 'react-router-dom';
import { useAuth } from "../AuthContext";
//import defaultLogo from '../assets/logo.svg';
//import TransparentButton from '../components/TransparentButton';
import PostComponent from '../components/PostComponent';
import '../css/Posts.css';
import '../css/ProfilePage.css';
import '../css/Friends.css';
//import { fetchProfileData, fetchProfilePicture } from '../functions/helper';
import FriendRequestComponent from '../components/FriendRequestComponent';
import FriendsComponent from '../components/FriendsComponent';
//import ProfilePagePopup from '../components/ProfilePagePopup';
import OwnProfileSection from '../components/OwnProfileSection';
import OtherProfileSection from '../components/OtherProfileSection';
import { useProfileState } from '../hooks/profileState';
import { useFriendshipState } from '../hooks/friendshipState';
import { sendFriendRequest, acceptFriendRequest, removeFriend, getIncomingRequestStatus, getOutgoingRequestStatus, getFriendshipStatus } from '../functions/friendFunctions';


/**
 * ProfilePage 
 * 
 * Renders a profile page that will display the default toolbar
 * and the username of the currently logged in user
 */
export default function ProfilePage() {
    //const [profileUsername, setProfileUsername] = useState('');
    //const [ppID, setPpID] = useState('');
    //const [profilePicture, setProfilePicture] = useState('');
    const { profileID } = useParams();
    const { user, logout, userID } = useAuth();
    //const [bioText, setBioText] = useState('');
    const navigate = useNavigate(); //navigation
    const [postText, setPostText] = useState('');
    const [image, setImage] = useState(null);
    const [postIds, setPostIds] = useState([]);
    const [posts, setPosts] = useState([]);
    //const [incomingReqFlag, setIncomingReqFlag] = useState(false);
    //const [outgoingReqFlag, setOutgoingReqFlag] = useState(false);
    //const [friendshipFlag, setFriendshipFlag] = useState(false);
    const [showPostPopup, setPostPopup] = useState(false);
    const [showEditPopup, setEditPopup] = useState(false);
    const [friendListRefreshTrigger, setFriendListRefreshTrigger] = useState(0);
    const placeholderText = "What's on your mind, " + user + "?";
    //let content;
    //let friendComponents;

    const {
        profileUsername,
        profilePicture,
        bioText,
        setBioText,
        ppID,
        refreshProfileData,
    } = useProfileState(profileID);

    const {
        incomingReqFlag,
        outgoingReqFlag,
        friendshipFlag,
        refreshFriendshipStatus,
    } = useFriendshipState(userID, profileID);

    const handleLogOut = async (e) => {
        e.preventDefault();

        logout();
        navigate('/Home');
    };

    const handleDeletePost = (postID) => {
        setPosts(posts.filter(post => post.postID !== postID));
    };

    const togglePostPopup = () => {
        setPostPopup(!showPostPopup);
    };

    const toggleEditPopup = () => {
        setEditPopup(!showEditPopup);
    }

    /**
     * handles profile edit submission
     * @param e
     * @returns {Promise<void>}
     */
    const handleEdit = async (e) => {
        e.preventDefault();

        if (bioText && bioText.length > 400) {
            alert("Bio cannot exceed 400 characters.");
            return;
        }

        toggleEditPopup();

        try {
            await updateProfile({ userID, image, bioText });

            // Refresh profile data to display the new profile picture
            refreshProfileData();
        } catch (err) {
            console.error(err);
        }

        // Clear the image after updating
        setImage(null);
    };

    const handleAccept = async (e) => {
        e.preventDefault();

        try {
            await acceptFriendRequest(userID, profileID);

            // Refresh friendship status to update the button
            refreshFriendshipStatus();

            // Refresh friend lists to show the new friend
            setFriendListRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        console.log(userID);
        console.log(profileID);

        try {
            await sendFriendRequest(userID, profileID);

            // Refresh friendship status to update the button
            refreshFriendshipStatus();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemove = async (e) => {
        e.preventDefault();

        try {
            const data = await removeFriend(userID, profileID);

            // Refresh friendship status to update the button
            refreshFriendshipStatus();

            // Refresh friend lists to remove the friend
            setFriendListRefreshTrigger(prev => prev + 1);

            if (data.flag) {
                alert("Successfully removed friend.");
            } else {
                alert("Error when removing friend.");
            }
        } catch (err) {
            console.error(err);
        }
    };


    // const handleAccept = async (e) => {
    //     e.preventDefault();

    //     await fetch(`http://localhost:3000/connections/accept-friend-request/${userID}/${Number(profileID)}`, 
    //     {
    //         method: 'GET',
    //         credentials: "include"
    //     }).then(async (res) => {
    //         const data = await res.json();

    //         if (!res.ok) {
    //             const error = new Error(data.error);
    //             error.code = data.errorCode;
    //             throw error;
    //         }
    //         return data; // successful response
    //     })
    //         .then((data) => {
    //             //On Success
    //         })
    //         .catch((err) => {
    //             // error
    //         });
    // }

    // const handleAdd = async (e) => {
    //     e.preventDefault();

    //     await fetch('http://localhost:3000/connections/send-friend-request/', {
    //         method: 'POST',
    //         credentials: "include",
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             fromUserID: userID,
    //             toUserID: Number(profileID)
    //         })
    //     }).then(async (res) => {
    //         const data = await res.json();

    //         if (!res.ok) {
    //             const error = new Error(data.error);
    //             error.code = data.errorCode;
    //             throw error;
    //         }
    //         return data; // successful response
    //     })
    //         .then((data) => {
    
    //         })
    //         .catch((err) => {
    //             // error
    //         });
    // }

    // const handleRemove = async (e) => {
    //     e.preventDefault();

    //     await fetch(`http://localhost:3000/connections/remove-friend/${userID}/${profileID}`, {
    //         method: 'DELETE',
    //         credentials: "include",
    //     }).then(async (res) => {
    //         const data = await res.json();

    //         if (!res.ok) {
    //             const error = new Error(data.error);
    //             error.code = data.errorCode;
    //             throw error;
    //         }
    //         return data; // successful response
    //     })
    //         .then((data) => {
    //             console.log(data);
    //             if(data.flag){
    //                 alert("Successfully removed friend.");
    //             } else {
    //                 alert("Error when removing friend.");
    //             }
    //         })
    //         .catch((err) => {
    //             // error
    //         });
    // }

    const handlePost = async (e) => {
        e.preventDefault();
        if (postText && postText.length > 400) {
            alert("Post text cannot exceed 400 characters.");
            return;
        }
        togglePostPopup();

        try {
            await createPost({
                userID,
                image,
                postText,
                username: user
            });

            // Refresh the post feed after creating a new post
            const ids = await fetchUserPostIds(profileID);
            setPostIds(ids);

            // Fetch all posts with the new IDs to ensure immediate update
            const allPosts = [];
            for (const id of ids) {
                const data = await getPostById(id);
                allPosts.push(data);
            }
            setPosts(allPosts);
        } catch (err) {
            console.error(err);
        }

        setPostText(null);
        setImage(null);
    };


    /**
     * gets IDs of this profile's posts currently stored in mongo
     * @param {*} e 
     */
    const getUserPostIds = async () => {
        try {
            const ids = await fetchUserPostIds(profileID);
            setPostIds(ids);
        } catch (err) {
            console.error(err);
        }
    };


    //on render get IDs of all posts
    useEffect(() => {
        console.log(`profileID for posts grab:${profileID}`);
        setPostIds([]);
        setPosts([]);
        getUserPostIds();
    }, [profileID]);

    //when postIds gets updated, fetch and store data for all posts
    useEffect(() => {
        if (postIds.length === 0) return;

        const fetchPosts = async () => {
            const allPosts = [];
            for (const id of postIds) {
                try {
                    const data = await getPostById(id);
                    allPosts.push(data);
                } catch (err) {
                    console.error(err);
                }
            }
            setPosts(allPosts);
        };

        fetchPosts();
    }, [postIds]);


    // if (profileID == userID) {
    //     content = <div>
    //         <Toolbar>
    //             <Link to="/">
    //                 <span className="transparent-text">Home</span>
    //             </Link>
    //             <TransparentButton onClick={handleLogOut}>Log Out</TransparentButton>
    //         </Toolbar>
    //         <div style={{ textAlign: 'center', marginTop: '50px' }}>
    //             <h1>Your Profile</h1>
    //             <img className='profilePictureLarge'
    //                 src={profilePicture || defaultLogo} // Using default catwalk logo for profile picture
    //                 alt="Profile"
    //             />
    //             <p>{bioText}</p>
    //             <TransparentButton onClick={togglePostPopup}>Create Post</TransparentButton>
    //             <TransparentButton onClick={toggleEditPopup}>Edit Profile</TransparentButton>
    //             <ProfilePagePopup
    //                 show={showPostPopup}
    //                 onClose={togglePostPopup}
    //                 title="Create Post"
    //                 onSubmit={handlePost}
    //                 textValue={postText}
    //                 textPlaceholder={placeholderText}
    //                 onTextChange={setPostText}
    //                 onImageChange={setImage}
    //             />
    //             <ProfilePagePopup
    //                 show={showEditPopup}
    //                 onClose={toggleEditPopup}
    //                 title="Edit Profile"
    //                 onSubmit={handleEdit}
    //                 textValue={bioText}
    //                 textPlaceholder={bioText}
    //                 onTextChange={setBioText}
    //                 onImageChange={setImage}
    //             />
    //         </div>
    //     </div>;
    //     friendComponents = 
    //         <div className='friendsListDiv'>
    //             <h1>Your Friends</h1>
    //             <FriendRequestComponent user={{ 'userID': userID }}></FriendRequestComponent>
    //             <FriendsComponent user={{ 'userID': userID }}></FriendsComponent>
    //         </div>;
    // } else {
    //     content = <div>
    //         <Toolbar>
    //             <Link to="/">
    //                 <span className="transparent-text">Home</span>
    //             </Link>
    //             <TransparentButton onClick={handleLogOut}>Log Out</TransparentButton>
    //         </Toolbar>
    //         <div style={{ textAlign: 'center', marginTop: '50px' }}>
    //             <h1>{profileUsername + "'s Profile" || "Loading profile..."}</h1>
    //             <img className='profilePictureLarge'
    //                 src={profilePicture || defaultLogo}
    //                 alt="Profile"
    //             />
    //             <p>{bioText}</p>
    //             {friendshipFlag?(
    //                 <TransparentButton onClick={handleRemove}>Remove Friend</TransparentButton>
    //             ):(
    //                 !incomingReqFlag?(
    //                     !outgoingReqFlag?(
    //                     <TransparentButton onClick={handleAdd}>Add Friend</TransparentButton>
    //                 ):(
    //                     <TransparentButton onClick={handleAdd}>Cancel Request</TransparentButton>
    //                 )
    //                 ):(
    //                     <TransparentButton onClick={handleAccept}>Accept</TransparentButton>
    //                 )
    //             )}
    //         </div>
    //     </div>;
    //     friendComponents = 
    //         <div className='friendsListDiv'>
    //             <h1>{profileUsername}'s Friends</h1>
    //             <FriendsComponent user={{ 'userID': profileID }}></FriendsComponent>
    //         </div>;
    // }

    // useEffect(() => {
    //     //console.log(`<ProfilePage-271>${profileID} id`);
    //     fetchProfileData(profileID).then(data => {
    //         setPpID(data.ppID);
    //         setBioText(data.bio);
    //         setProfileUsername(data.username);
    //     });
    // }, [profileID]);

    // useEffect(() => {
    //     //console.log(`<ProfilePage289> ${ppID} ppid`);
    //     fetchProfilePicture(ppID).then(imgSrc => {
    //         setProfilePicture(imgSrc);
    //     });
    // }, [ppID]);

    // useEffect(() => {
    //     console.log(`<ProfilePage> Auth userID: ${userID}`);

    //     const updateFlags = async () => {
    //         try {
    //             const incFlag = await getIncomingRequestStatus(userID, profileID);
    //             setIncomingReqFlag(incFlag);

    //             const outFlag = await getOutgoingRequestStatus(userID, profileID);
    //             setOutgoingReqFlag(outFlag);

    //             const friendFlag = await getFriendshipStatus(userID, profileID);
    //             setFriendshipFlag(friendFlag);

    //         } catch (err) {
    //             console.error(err);
    //         }
    //     };

    //     if (userID && profileID) {
    //         updateFlags();
    //     }
    // }, [userID, profileID]);


    // useEffect(() => {
    //     console.log(`<ProfilePage> Auth userID: ${userID}`);

    //     const updateIncReqFlag = async () => {
    //         await fetch(`http://localhost:3000/connections/friend-request-status/${userID}/${Number(profileID)}`, {
    //             method: 'GET',
    //             credentials: "include"
    //         }).then(async (res) => {
    //             const data = await res.json();

    //             if (!res.ok) {
    //                 const error = new Error(data.error);
    //                 error.code = data.errorCode;
    //                 throw error;
    //             }
    //             return data; // successful response
    //         }).then((data) => {
    //             setIncomingReqFlag(data.flag);
    //             console.log(`flag: ${data.flag}`);
    //         }).catch((err) => {
    //             // error
    //         });
    //     }
    //     updateIncReqFlag();

    //     const updateOutReqFlag = async () => {
    //         await fetch(`http://localhost:3000/connections/inc-friend-request-status/${userID}/${Number(profileID)}`, {
    //             method: 'GET',
    //             credentials: "include"
    //         }).then(async (res) => {
    //             const data = await res.json();

    //             if (!res.ok) {
    //                 const error = new Error(data.error);
    //                 error.code = data.errorCode;
    //                 throw error;
    //             }
    //             return data; // successful response
    //         }).then((data) => {
    //             setOutgoingReqFlag(data.flag);
    //             console.log(`flag: ${data.flag}`);
    //         }).catch((err) => {
    //             // error
    //         });
    //     }
    //     updateOutReqFlag();

    //     const updateFriendshipFlag = async () => {
    //         await fetch(`http://localhost:3000/connections/friendship-status/${userID}/${Number(profileID)}`, {
    //             method: 'GET',
    //             credentials: "include"
    //         }).then(async (res) => {
    //             const data = await res.json();

    //             if (!res.ok) {
    //                 const error = new Error(data.error);
    //                 error.code = data.errorCode;
    //                 throw error;
    //             }
    //             return data; // successful response
    //         }).then((data) => {
    //             setFriendshipFlag(data.flag);
    //             console.log(`friend flag: ${data.flag}`);
    //         }).catch((err) => {
    //             // error
    //         });
    //     }
    //     updateFriendshipFlag();
    // }, [userID]);

    const isOwnProfile = profileID == userID;

    return (
        <div className="profilePageWrapper">
            {isOwnProfile ? (
                <OwnProfileSection
                    user={user}
                    userID={userID}
                    profilePicture={profilePicture}
                    bioText={bioText}
                    placeholderText={placeholderText}
                    showPostPopup={showPostPopup}
                    showEditPopup={showEditPopup}
                    togglePostPopup={togglePostPopup}
                    toggleEditPopup={toggleEditPopup}
                    handlePost={handlePost}
                    handleEdit={handleEdit}
                    setPostText={setPostText}
                    postText={postText}
                    setBioText={setBioText}
                    setImage={setImage}
                    handleLogOut={handleLogOut}
                />
            ) : (
                <OtherProfileSection
                    profileUsername={profileUsername}
                    profilePicture={profilePicture}
                    bioText={bioText}
                    friendshipFlag={friendshipFlag}
                    incomingReqFlag={incomingReqFlag}
                    outgoingReqFlag={outgoingReqFlag}
                    handleLogOut={handleLogOut}
                    handleAdd={handleAdd}
                    handleAccept={handleAccept}
                    handleRemove={handleRemove}
                />
            )}

            <div className="profileContentDiv">
                <div className="postsDiv">
                    {posts.map((post) => (
                        <PostComponent key={post.postID} post={post} onDelete={handleDeletePost} />
                    ))}
                </div>
                <div className="friendsListDiv">
                    {isOwnProfile ? (
                        <>
                            <h1>Your Friends</h1>
                            <FriendRequestComponent
                                user={{ userID }}
                                refreshTrigger={friendListRefreshTrigger}
                                onFriendAdded={() => setFriendListRefreshTrigger(prev => prev + 1)}
                            />
                            <FriendsComponent user={{ userID }} refreshTrigger={friendListRefreshTrigger} canRemove={true} />
                        </>
                    ) : (
                        <>
                            <h1>{profileUsername}'s Friends</h1>
                            <FriendsComponent user={{ userID: profileID }} refreshTrigger={friendListRefreshTrigger} canRemove={false} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );


}