import { useState, useEffect } from "react";
import { fetchProfileData, fetchProfilePicture } from "../functions/helper";

/**
 * Holds all profile related state + effects:
 * - username
 * - profile picture id
 * - profile picture image
 * - bio text
 */
export function useProfileState(profileID) {
    const [profileUsername, setProfileUsername] = useState("");
    const [ppID, setPpID] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [bioText, setBioText] = useState("");
    const [refreshCounter, setRefreshCounter] = useState(0);

    // Manually refresh profile data
    const refreshProfileData = () => {
        setRefreshCounter(prev => prev + 1);
    };

    // Load profile data when profileID changes or when manually refreshed
    useEffect(() => {
        if (!profileID) return;

        fetchProfileData(profileID).then((data) => {
            setPpID(data.ppID);
            setBioText(data.bio);
            setProfileUsername(data.username);
        }).catch((err) => {
            console.error("Error fetching profile data:", err);
        });
    }, [profileID, refreshCounter]);

    // Load profile picture once we know the ppID or when manually refreshed
    useEffect(() => {
        if (!ppID) return;

        fetchProfilePicture(ppID).then((imgSrc) => {
            setProfilePicture(imgSrc);
        }).catch((err) => {
            console.error("Error fetching profile picture:", err);
        });
    }, [ppID, refreshCounter]);

    return {
        profileUsername,
        profilePicture,
        bioText,
        setBioText,
        ppID,
        refreshProfileData,
    };
}
