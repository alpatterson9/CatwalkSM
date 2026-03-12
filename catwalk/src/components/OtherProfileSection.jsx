// src/components/OtherProfileSection.jsx
import { Link } from 'react-router-dom';
import Toolbar from './Toolbar';
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import '../css/ProfilePage.css';

export default function OtherProfileSection({
    profileUsername,
    profilePicture,
    bioText,
    friendshipFlag,
    incomingReqFlag,
    outgoingReqFlag,
    handleLogOut,
    handleAdd,
    handleAccept,
    handleRemove,
}) {
    return (
        <>
            <Toolbar>
                <Link to="/">
                    <span className="transparent-text">Home</span>
                </Link>
                <TransparentButton onClick={handleLogOut}>Log Out</TransparentButton>
            </Toolbar>

            <div className="profileCardWrapper">
                <div className="profileCard">
                    <h1>{profileUsername + "'s Profile" || "Loading profile..."}</h1>

                    <img
                        className="profilePictureLarge"
                        src={profilePicture || defaultLogo}
                        alt="Profile"
                    />

                    <p>{bioText}</p>

                    <div className="buttonGroup">
                        {friendshipFlag ? (
                            <TransparentButton onClick={handleRemove}>
                                Remove Friend
                            </TransparentButton>
                        ) : !incomingReqFlag ? (
                            !outgoingReqFlag ? (
                                <TransparentButton onClick={handleAdd}>
                                    Add Friend
                                </TransparentButton>
                            ) : (
                                <TransparentButton onClick={handleAdd}>
                                    Cancel Request
                                </TransparentButton>
                            )
                        ) : (
                            <TransparentButton onClick={handleAccept}>
                                Accept
                            </TransparentButton>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
