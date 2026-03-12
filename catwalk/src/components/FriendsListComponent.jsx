/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This Component is used to display an individual friend list element.
 */
import '../css/Friends.css';
import { useAuth } from "../AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import { fetchProfileData, fetchProfilePicture } from '../functions/helper';

const FriendsListComponent = ({ user, onRemove, canRemove }) => {
    const navigate = useNavigate(); //navigation
    const userID = user;
    const { userID: currentUserID } = useAuth();
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [ppID, setPpID] = useState('');
    const isInitialppID = useRef(true);

    const handleUserClick = async (e) => {
        e.preventDefault();
        navigate(`/Profile/${userID}`);
    };

    const handleRemove = async (e) => {
        e.preventDefault();

        await fetch(`http://localhost:3000/connections/remove-friend/${currentUserID}/${userID}`, {
            method: 'DELETE',
            credentials: "include",
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
                console.log(data);
                if(data.flag){
                    // Call onRemove callback to update parent state
                    if (onRemove) {
                        onRemove(userID);
                    }
                } else {
                    alert("Error when removing friend.");
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
                {canRemove && (
                    <TransparentButton className="transparentButtonSmall" onClick={handleRemove}>Remove</TransparentButton>
                )}
            </div>
        </div>
    );
}
export default FriendsListComponent;