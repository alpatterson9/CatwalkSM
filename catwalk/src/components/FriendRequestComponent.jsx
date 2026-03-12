/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This Component is used to display incoming friend requests.
 */
import '../css/Friends.css'; // Import your CSS for styling
import { useAuth } from "../AuthContext"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import { fetchProfileData, fetchProfilePicture } from '../functions/helper';
import FriendRequestListComponent from './FriendRequestListComponent';

const FriendRequestComponent = ({ user, refreshTrigger }) => {
    const navigate = useNavigate(); //navigation
    const { userID } = user;
    const [incomingReqIDs, setIncomingReqIDs] = useState([]);

    useEffect(() => {
        const getIncomingReqIDs = async () => {
            await fetch(`http://localhost:3000/connections/getFriendReqIDs/${userID}`, {
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
        console.log(`incoming userIDs: ${incomingReqIDs}`);
    }, [incomingReqIDs]);


    return (
        <div>
            {incomingReqIDs.length > 0 && (
                <div className="friendsSectionHeader">Friend Requests</div>
            )}
            <div>
                {incomingReqIDs.map((id, index) => (
                <FriendRequestListComponent key={id || index} user={id} />
                ))}
            </div>
        </div>
    );
}
export default FriendRequestComponent;