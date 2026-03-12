import { useState, useEffect } from "react";
import {
    getIncomingRequestStatus,
    getOutgoingRequestStatus,
    getFriendshipStatus,
} from "../functions/friendFunctions";

/**
 * Holds friend request / friendship flags
 */
export function useFriendshipState(userID, profileID) {
    const [incomingReqFlag, setIncomingReqFlag] = useState(false);
    const [outgoingReqFlag, setOutgoingReqFlag] = useState(false);
    const [friendshipFlag, setFriendshipFlag] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);

    // Manually refresh friendship status
    const refreshFriendshipStatus = () => {
        setRefreshCounter(prev => prev + 1);
    };

    useEffect(() => {
        if (!userID || !profileID) return;

        const updateFlags = async () => {
            try {
                const inc = await getIncomingRequestStatus(userID, profileID);
                const out = await getOutgoingRequestStatus(userID, profileID);
                const friend = await getFriendshipStatus(userID, profileID);

                setIncomingReqFlag(inc);
                setOutgoingReqFlag(out);
                setFriendshipFlag(friend);
            } catch (err) {
                console.error("Error updating friendship flags:", err);
            }
        };

        updateFlags();
    }, [userID, profileID, refreshCounter]);

    return {
        incomingReqFlag,
        outgoingReqFlag,
        friendshipFlag,
        setIncomingReqFlag,
        setOutgoingReqFlag,
        setFriendshipFlag,
        refreshFriendshipStatus,
    };
}
