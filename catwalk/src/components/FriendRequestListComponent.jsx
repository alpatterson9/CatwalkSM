/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This Component is used to display an individual incoming friend request.
 */
import '../css/Friends.css'; // Import your CSS for styling
import { useAuth } from "../AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import { fetchProfileData, fetchProfilePicture } from '../functions/helper';

const FriendRequestListComponent = ({ user, onAccept }) => {
    const navigate = useNavigate(); //navigation
    const userID = user;
    const { userID: currentUserID } = useAuth();
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [ppID, setPpID] = useState('');
    const isInitialppID = useRef(true);

    const handleUserClick = async (e) => {
        console.log("ye");
        e.preventDefault();
        navigate(`/Profile/${userID}`);
    };

    const handleAccept = async (e) => {
        e.preventDefault();

        await fetch(`http://localhost:3000/connections/accept-friend-request/${currentUserID}/${userID}`, 
        {
            method: 'GET',
            credentials: "include"
        }).then(async (res) => {
            const data = await res.json();

            if (!res.ok) {
                const error = new Error(data.error);
                error.code = data.errorCode;
                throw error;
            }
            return data; // successful response
        })
            .then((data) => {
                // Call onAccept callback to update parent state
                if (onAccept) {
                    onAccept(userID);
                }
            })
            .catch((err) => {
                // error
            });
    }

    useEffect(() => {
        //console.log(`<FRLC-28>${userID} id`);
        fetchProfileData(userID).then(data => {
            setPpID(data.ppID);
            setUsername(data.username);
        });
    }, [userID]);

    useEffect(() => {
        if (isInitialppID.current) {
            isInitialppID.current = false;
        } else {
            //console.log(`<CommentComponent-34>${ppID} ppid`);
            fetchProfilePicture(ppID).then(imgSrc => {
                setProfilePicture(imgSrc);
            });
        }
    }, [ppID]);

    return (
        <div>
            <div className='requestDiv'>
                <img
                    className="profilePictureXS"
                    src={profilePicture || defaultLogo}
                    onClick={handleUserClick}
                />
                <p onClick={handleUserClick} className='commentUsername'>{username}</p>
                <TransparentButton className="transparentButtonSmall" onClick={handleAccept}>Accept</TransparentButton>
            </div>
        </div>
    );
}
export default FriendRequestListComponent;