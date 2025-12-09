/**
 * BUBBLE EDGES Subcollection
 * Path: /bubbles/{bubbleId}/edges/{edgeId}
 * The relationship and referral engine (the lines connecting the nodes).
 */
class BubbleEdge {
    /**
     * @param {string} edgeId - Document Key
     * @param {string} fromNode - The nodeId originating the connection (e.g., referrer).
     * @param {string} toNode - The nodeId being connected (e.g., referee).
     * @param {string} relationship - The nature of the link (e.g., "Parent," "ReferredBy").
     * @param {string} referralToken - Short, one-time token used for the invite link.
     * @param {boolean} accepted - true if the invite/link is active; false if pending.
     * @param {number} tier - Used in pathfinding calculation (e.g., 1 for direct link).
     * @param {firebase.firestore.Timestamp} createdAt - Time the edge was created.
     */
    constructor(edgeId, fromNode, toNode, relationship, referralToken, accepted, tier, createdAt) {
        this.edgeId = edgeId;
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.relationship = relationship;
        this.referralToken = referralToken;
        this.accepted = accepted;
        this.tier = tier;
        this.createdAt = createdAt;
    }
}

export default BubbleEdge;
