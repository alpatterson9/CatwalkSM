/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This Component is used to display an individual search bar element.
 */
import '../css/Friends.css';
import { useAuth } from "../AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import { fetchProfileData, fetchProfilePicture } from '../functions/helper';

const SearchBarItem = ({ user }) => {
    const navigate = useNavigate(); //navigation
    const { id: userID } = user;
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [ppID, setPpID] = useState('');
    const isInitialppID = useRef(true);

    const handleUserClick = async (e) => {
        e.preventDefault();
        navigate(`/Profile/${userID}`);
    };

    useEffect(() => {
        //console.log(`<SBI 29>${userID} id`);
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
            </div>
        </div>
    );
}
export default SearchBarItem;