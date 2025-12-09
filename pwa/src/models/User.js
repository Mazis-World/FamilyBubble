/**
 * USERS Collection
 * The global profile for every human.
 */
class User {
    /**
     * @param {string} userId - Document Key
     * @param {string} fullName - User's full name.
     * @param {string} photoURL - Link to the user's profile picture.
     * @param {firebase.firestore.Timestamp} createdAt - Time the user profile was created.
     * @param {boolean} premium - RevenueCat subscription status. Global setting.
     * @param {Array<string>} bubbles - List of all bubbleIds this user is a member of. Essential for membership check.
     */
    constructor(userId, fullName, photoURL, createdAt, premium, bubbles) {
        this.userId = userId;
        this.fullName = fullName;
        this.photoURL = photoURL;
        this.createdAt = createdAt;
        this.premium = premium;
        this.bubbles = bubbles;
    }
}

export default User;