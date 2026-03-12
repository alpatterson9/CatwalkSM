/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * Component used to display and interact with a user post
 */
import '../css/Posts.css'; // Import your CSS for styling
import { useAuth } from "../AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import Popup from './Popup';
import CommentComponent from './CommentComponent';
import { fetchProfileData, fetchProfilePicture } from '../functions/helper';

/**
 * 
 * @param {*} json containing a post's data 
 * @returns a div that displays a post
 */
const PostComponent = ({ post, onDelete }) => {
    const navigate = useNavigate(); //navigation
    const { userID, user } = useAuth();
    const { text, image, contentType, username, likes, postID, comments: initialComments } = post;
    const postUID = post.userID;
    const [ppID, setPpID] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [likeButton, setLikeButton] = useState("");
    const isInitialppID = useRef(true);
    const isInitialpostUID = useRef(true);
    const [likeTotal, updateLikes] = useState(likes.length);
    const [comments, setComments] = useState(initialComments);
    const [showCommentPopup, setCommentPopup] = useState(false);
    const [commentText, setCommentText] = useState();
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showClearCommentsConfirm, setShowClearCommentsConfirm] = useState(false);
    const commentPlaceholderText = "What's on your mind, " + user + "?";
    let commentPopup;

    let imgSrc = null;
    if (image && contentType) {
        imgSrc = `data:${contentType};base64,${image}`;
    }

    const toggleCommentPopup = () => {
        setCommentPopup(!showCommentPopup);
    };

    const likeButtonClick = async (e) => {
        //goes to like route for this user and post
        await fetch(`http://localhost:3000/posts/${postID}/like/${userID}`, {
            method: 'POST',
        }).then(async (res) => {
            const data = await res.json();

            if (!res.ok) {
                const error = new Error(data.error);
                error.code = data.errorCode;
                throw error;
            }
            return data; // successful response
        }).then((data) => {
            //updates the local use state to accurately display number of likes
            updateLikes(data.likes.length);
            checkLikes(data.likes);
        }).catch((err) => {
            // error
        });
    };

    const postUserClick = async (e) => {
        e.preventDefault();
        navigate(`/Profile/${postUID}`);
    };

    function checkLikes(likeArray){
        likeArray.includes(userID) ? setLikeButton("😻") : setLikeButton("😽");
    }

    useEffect(() => {
        if (isInitialpostUID.current) {
            isInitialpostUID.current = false;
        }
        else {
            fetchProfileData(postUID).then(data => {
                setPpID(data.ppID);
            });
        }
    }, [postUID]);

    useEffect(() => {
        if (isInitialppID.current) {
            isInitialppID.current = false;
        } else {
            //console.log(`<PostComponent-100>${ppID} ppid`);
            fetchProfilePicture(ppID).then(imgSrc => {
                setProfilePicture(imgSrc);
            });
        }
    }, [ppID]);

    useEffect(() => {
        checkLikes(likes);
    }, []);

    //commentPopup = <>
    //    {showCommentPopup && (
    //        <Popup onClose={toggleCommentPopup}>
    //            <h3>Comment</h3>
    //            <form style={{
    //                display: 'flex',
    //                justifyContent: 'center',
    //                alignItems: 'center',
    //                flexDirection: 'column',
    //            }}>
    //                <input type="text"
    //                    placeholder={commentPlaceholderText}
    //                    style={{ width: '300px', height: '15px', fontSize: '12px' }}
    //                    value={commentText}
    //                    ref={null}
    //                    onChange={(e) => setCommentText(e.target.value)}>
    //                </input>
    //                <TransparentButton type="button" onClick={handleComment}>Post</TransparentButton>
    //            </form>
    //        </Popup>
    //    )}
    //</>;

    const handleComment = async (e) => {
        e.preventDefault();

        if (commentText && commentText.length > 800) {
            alert("Comment cannot exceed 800 characters.");
            return;
        }

        toggleCommentPopup();
        console.log(`Comment text: ${commentText}`);
        const body = { text: commentText };

        await fetch(`http://localhost:3000/posts/${postID}/comment/${userID}`, {
            method: 'PUT', // Specify the HTTP method as POST
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then(async (res) => {
            const data = await res.json(); // extract JSON body
            console.log(data);

            if (!res.ok) {
                const error = new Error(data.error);
                error.code = data.errorCode;
                throw error;
            }
            return data; // successful response
        }).then((data) => {
            //updates the local state to automatically display a new comment
            setComments(data.comments);
            console.log(data.comments);
        }).catch((err) => {
            // error
        });

        // Clear the comment text after posting
        setCommentText('');
    }

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleDeleteClick = () => {
        setShowMenu(false);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await fetch(`http://localhost:3000/posts/${postID}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete post');
            }

            setShowDeleteConfirm(false);
            // Call the onDelete callback to remove post from parent state
            if (onDelete) {
                onDelete(postID);
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            setShowDeleteConfirm(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleClearCommentsClick = () => {
        setShowMenu(false);
        setShowClearCommentsConfirm(true);
    };

    const confirmClearComments = async () => {
        try {
            const res = await fetch(`http://localhost:3000/posts/${postID}/comments`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                console.error(data.error || 'Failed to clear comments');
            }

            setComments([]);
            setShowClearCommentsConfirm(false);
        } catch (err) {
            console.error('Error clearing comments:', err);
            setShowClearCommentsConfirm(false);
        }
    };

    const cancelClearComments = () => {
        setShowClearCommentsConfirm(false);
    };

    // Check if current user is the post owner
    const isPostOwner = userID === postUID;

    return (
        <div className="postDiv">
            <div className="postHeader">
                <img
                    className="profilePictureSmall"
                    src={profilePicture || defaultLogo}
                    onClick={postUserClick}
                />
                <p className="postUsername" onClick={postUserClick}>{username}</p>
                {isPostOwner && (
                    <div className="postMenuContainer">
                        <button className="postMenuButton" onClick={toggleMenu}>⋮</button>
                        {showMenu && (
                            <div className="postMenuDropdown">
                                <button className="postMenuOption" onClick={handleDeleteClick}>
                                    Delete Post
                                </button>
                                {comments.length > 0 && (
                                    <button className="postMenuOption" onClick={handleClearCommentsClick}>
                                        Clear Comments
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {showDeleteConfirm && (
                <Popup onClose={cancelDelete}>
                    <h3>Confirm Delete</h3>
                    <p>Are you sure you want to delete this post?</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <TransparentButton onClick={confirmDelete}>Yes, Delete</TransparentButton>
                        <TransparentButton onClick={cancelDelete}>Cancel</TransparentButton>
                    </div>
                </Popup>
            )}
            {showClearCommentsConfirm && (
                <Popup onClose={cancelClearComments}>
                    <h3>Clear Comments</h3>
                    <p>Are you sure you want to remove all comments from this post?</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <TransparentButton onClick={confirmClearComments}>Yes, Clear All</TransparentButton>
                        <TransparentButton onClick={cancelClearComments}>Cancel</TransparentButton>
                    </div>
                </Popup>
            )}
            {imgSrc && <img src={imgSrc} alt="Post" className="postImage" />}
            <p className="postText">{text}</p>
            <TransparentButton onClick={likeButtonClick}>{likeButton}
                <p>{likeTotal}</p>
            </TransparentButton>
            <TransparentButton onClick={toggleCommentPopup}>Comment</TransparentButton>
            {showCommentPopup && (
                <Popup onClose={toggleCommentPopup}>
                    <h3>Comment</h3>
                    <form style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}>
                        <textarea
                            placeholder={commentPlaceholderText}
                            style={{
                                width: '300px',
                                height: '80px',
                                fontSize: '12px',
                                resize: 'vertical',
                                padding: '8px',
                                borderRadius: '4px',
                                border: commentText && commentText.length > 800 ? '2px solid red' : '1px solid #ccc'
                            }}
                            value={commentText || ''}
                            onChange={(e) => setCommentText(e.target.value)}>
                        </textarea>
                        <span style={{
                            fontSize: '12px',
                            color: commentText && commentText.length > 800 ? 'red' : '#666',
                            marginTop: '5px'
                        }}>
                            {commentText ? commentText.length : 0}/800 characters
                        </span>
                        <TransparentButton type="button" onClick={handleComment}>Post</TransparentButton>
                    </form>
                </Popup>
            )}
            {comments.map(comment => (//uses map to create a CommentComponent for
                //each comment currently stored
                <CommentComponent key={comment.commentID} comment={comment} />
            ))}
        </div>
    );
};

export default PostComponent;