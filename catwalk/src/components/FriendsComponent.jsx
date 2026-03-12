/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This Component is used to display friends.
 */
import '../css/Friends.css'; // Import your CSS for styling
import { useAuth } from "../AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import { fetchProfileData, fetchProfilePicture } from '../functions/helper';
import FriendsListComponent from './FriendsListComponent';

const FriendsComponent = ({ user, refreshTrigger, canRemove }) => {
    const navigate = useNavigate(); //navigation
    const { userID } = user;
    const [incomingReqIDs, setIncomingReqIDs] = useState([]);

    useEffect(() => {
        const getIncomingReqIDs = async () => {
            await fetch(`http://localhost:3000/connections/getFriendIDs/${userID}`, {
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
            }).then((data) => {
                setIncomingReqIDs(data.users);
            }).catch((err) => {
                // error
            });
        }
        getIncomingReqIDs();
    }, [userID, refreshTrigger]);

    useEffect(() => {
    }, [incomingReqIDs]);

    const handleRemoveFriend = (removedUserID) => {
        setIncomingReqIDs(incomingReqIDs.filter(id => id !== removedUserID));
    };

    return (
        <div>
            <div>
                {incomingReqIDs.map((id, index) => (
                <FriendsListComponent key={id || index} user={id} onRemove={handleRemoveFriend} canRemove={canRemove} />
                ))}
            </div>
        </div>
    );
}
export default FriendsComponent;