// Create a new post
export async function createPost({ userID, image, postText, username }) {
    const formData = new FormData();
    formData.append('userID', userID);
    if (image) formData.append('image', image);
    if (postText) formData.append('text', postText);
    if (username) formData.append('username', username);

    const res = await fetch('http://localhost:3000/posts/create', {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    return data;
}

// Get post IDs for a user
export async function getUserPostIds(profileID) {
    const res = await fetch(`http://localhost:3000/posts/getUserPostIds/${profileID}`, {
        method: 'GET'
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    // you were doing setPostIds(data) before, so just return the raw data
    return data;
}

// Get a single post by ID
export async function getPostById(postID) {
    const res = await fetch(`http://localhost:3000/posts/${postID}`, {
        method: 'GET'
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.error);
        error.code = data.errorCode;
        throw error;
    }

    return data;
}
