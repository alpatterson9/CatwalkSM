/**
 * Robin Howard, Andrew Patterson, Elliott Scheid
 * 
 * This file contains helper functions for commonly used code in the rest of the project
 */
import defaultLogo from '../assets/logo.svg';

/**
 * Gets data from a specific profile
 * @param {Number} userID the id of the user to fetch info of
 * @returns json object containing user's information
 */
export const fetchProfileData = async (userID) => {
    //console.log(`<Helper-2>${userID}`);
    const res = await fetch(`http://localhost:3000/users/getProfileData/${userID}`);
    const data = await res.json();
    return data;
}

/**
 * Gets profile picture of a user
 * @param {String} ppID the post ID corresponding to an image in the database
 * @returns the raw image
 */
export const fetchProfilePicture = async (ppID) => {
    //console.log(`<Helper-9>${ppID}`);
    const res = await fetch(`http://localhost:3000/posts/${ppID}`);
    const data = await res.json();
    let imgSrc = null;
    if (data.image && data.contentType) {
        imgSrc = `data:${data.contentType};base64,${data.image}`;
        return imgSrc;
    }
    return defaultLogo;
}