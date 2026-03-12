// Update profile (bio + profile picture)
export async function updateProfile({ userID, image, bioText }) {
    const formData = new FormData();
    formData.append('userID', userID);
    if (image) formData.append('image', image);
    if (bioText) formData.append('text', bioText);

    const res = await fetch('http://localhost:3000/users/updateProfile', {
        method: 'PUT',
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