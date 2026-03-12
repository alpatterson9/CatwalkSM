// Accept friend request
export async function acceptFriendRequest(userID, profileID) {
    const res = await fetch(
        `http://localhost:3000/connections/accept-friend-request/${userID}/${profileID}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    );

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    return data;
}

// Send friend request
export async function sendFriendRequest(userID, profileID) {
    console.log("sending friend request");
    console.log(userID);
    console.log(profileID);
    const res = await fetch('http://localhost:3000/connections/send-friend-request/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fromUserID: userID,
            toUserID: profileID
        })
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    return data;
}

// Remove friend
export async function removeFriend(userID, profileID) {
    const res = await fetch(
        `http://localhost:3000/connections/remove-friend/${userID}/${profileID}`,
        {
            method: 'DELETE',
            credentials: 'include'
        }
    );

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    return data;
}

// Incoming friend request status
export async function getIncomingRequestStatus(userID, profileID) {
    const res = await fetch(
        `http://localhost:3000/connections/friend-request-status/${userID}/${profileID}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    );

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    // you only need the flag
    return data.flag;
}

// Outgoing friend request status
export async function getOutgoingRequestStatus(userID, profileID) {
    const res = await fetch(
        `http://localhost:3000/connections/inc-friend-request-status/${userID}/${profileID}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    );

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    return data.flag;
}

// Friendship status
export async function getFriendshipStatus(userID, profileID) {
    const res = await fetch(
        `http://localhost:3000/connections/friendship-status/${userID}/${profileID}`,
        {
            method: 'GET',
            credentials: 'include'
        }
    );

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    return data.flag;
}
