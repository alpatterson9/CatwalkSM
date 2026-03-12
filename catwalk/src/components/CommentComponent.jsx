/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This Component is used to display a single comment on a post
 */
import '../css/Posts.css'; // Import your CSS for styling
import { useAuth } from "../AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import { fetchProfileData, fetchProfilePicture } from '../functions/helper';

const CommentComponent = ({ comment }) => {
    const navigate = useNavigate(); //navigation
    const { text, userID } = comment;
    const [username, setUsername] = useState();
    const [profilePicture, setProfilePicture] = useState('');
    const [ppID, setPpID] = useState('');
    const isInitialppID = useRef(true);

    const handleUserClick = async (e) => {
        e.preventDefault();
        navigate(`/Profile/${userID}`);
    };

    useEffect(() => {
        //console.log(`<CommentComponent-23>${userID} id`);
        fetchProfileData(userID).then(data => {
            setUsername(data.username);
            setPpID(data.ppID);
        });
    }, [userID]);

    useEffect(() => {
        if (isInitialppID.current) {
            isInitialppID.current = false;
        } else {
            //console.log(`<CommentComponent-34>${ppID} ppid`);
            fetchProfilePicture(ppID).then(imgSrc =>{
                setProfilePicture(imgSrc);
            });
        }
    }, [ppID]);

    return (
        <div>
            <div className="postHeader">
                <img
                    className="profilePictureSmall"
                    src={profilePicture || defaultLogo}
                    onClick={handleUserClick}
                />
                <p onClick={handleUserClick} className='commentUsername'>{username}</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;{text}</p>
            </div>
        </div>
    );
}
export default CommentComponent;