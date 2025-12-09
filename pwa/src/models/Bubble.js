/**
 * BUBBLES Collection
 * The container for a group.
 */
class Bubble {
    /**
     * @param {string} bubbleId - Document Key
     * @param {string} ownerId - The userId of the bubble creator.
     * @param {string} name - Name of the bubble (e.g., "Smith Family").
     * @param {firebase.firestore.Timestamp} createdAt - Time the bubble was created.
     * @param {number} maxMembers - Max member count, tied to subscription tier.
     * @param {string} inviteCode - Short, unique code for joining via URL.
     * @param {string} visibility - "private" or "public-preview". Controls external visibility.
     */
    constructor(bubbleId, ownerId, name, createdAt, maxMembers, inviteCode, visibility) {
        this.bubbleId = bubbleId;
        this.ownerId = ownerId;
        this.name = name;
        this.createdAt = createdAt;
        this.maxMembers = maxMembers;
        this.inviteCode = inviteCode;
        this.visibility = visibility;
    }
}

export default Bubble;
