/**
 * BUBBLE NODES Subcollection
 * Path: /bubbles/{bubbleId}/nodes/{nodeId}
 * The per-bubble representation of a user.
 */
class BubbleNode {
    /**
     * @param {string} nodeId - Document Key
     * @param {string} userId - Reference to the user's global profile.
     * @param {string} role - User's role within this bubble (e.g., "Mom," "Cousin").
     * @param {string} status - "safe", "busy", "offline", "help".
     * @param {string} quote - A quote displayed beneath their circle/face.
     * @param {number} tier - Calculated closeness to the viewing user (1, 2, 3).
     * @param {string} type - "owner", "member", "referral".
     * @param {firebase.firestore.Timestamp} createdAt - Time the node was created (user joined).
     * @param {firebase.firestore.Timestamp} lastUpdated - Time of the last status/data change.
     */
    constructor(nodeId, userId, role, status, quote, tier, type, createdAt, lastUpdated) {
        this.nodeId = nodeId;
        this.userId = userId;
        this.role = role;
        this.status = status;
        this.quote = quote;
        this.tier = tier;
        this.type = type;
        this.createdAt = createdAt;
        this.lastUpdated = lastUpdated;
    }
}

export default BubbleNode;
