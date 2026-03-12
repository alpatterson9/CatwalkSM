// src/components/OwnProfileSection.jsx
import { Link } from 'react-router-dom';
import Toolbar from './Toolbar';
import TransparentButton from './TransparentButton';
import defaultLogo from '../assets/logo.svg';
import ProfilePagePopup from './ProfilePagePopup';
import '../css/ProfilePage.css';

export default function OwnProfileSection({
    user,
    userID,
    profilePicture,
    bioText,
    placeholderText,
    showPostPopup,
    showEditPopup,
    togglePostPopup,
    toggleEditPopup,
    handlePost,
    handleEdit,
    setPostText,
    postText,
    setBioText,
    setImage,
    handleLogOut,
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
                    <h1>Your Profile</h1>

                    <img
                        className="profilePictureLarge"
                        src={profilePicture || defaultLogo}
                        alt="Profile"
                    />

                    <p>{bioText}</p>

                    <div className="buttonGroup">
                        <TransparentButton onClick={togglePostPopup}>
                            Create Post
                        </TransparentButton>
                        <TransparentButton onClick={toggleEditPopup}>
                            Edit Profile
                        </TransparentButton>
                    </div>

                    <ProfilePagePopup
                        show={showPostPopup}
                        onClose={togglePostPopup}
                        title="Create Post"
                        onSubmit={handlePost}
                        textValue={postText}
                        textPlaceholder={placeholderText}
                        onTextChange={setPostText}
                        onImageChange={setImage}
                        maxLength={200}
                    />
                    <ProfilePagePopup
                        show={showEditPopup}
                        onClose={toggleEditPopup}
                        title="Edit Profile"
                        onSubmit={handleEdit}
                        textValue={bioText}
                        textPlaceholder={bioText || "Tell us about yourself..."}
                        onTextChange={setBioText}
                        onImageChange={setImage}
                        maxLength={400}
                    />
                </div>
            </div>
        </>
    );
}
