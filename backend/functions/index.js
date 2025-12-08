const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// Function to create a bubble (root node) for an owner
exports.createBubble = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  const newNode = {
    ownerId: uid,
    name: displayName || email,
    status: 'Safe',
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    type: 'Active',
    tier: 1,
  };

  await db.collection('nodes').doc(uid).set(newNode);
});

// Function to generate a referral token
exports.generateReferralToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to generate a referral token.');
    }

    const { uid } = context.auth;
    const { toNode } = data;

    // Generate a random token
    const referralToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newEdge = {
        fromNode: uid,
        toNode: toNode, // This will be empty until the participant signs up
        referralToken: referralToken,
        accepted: false,
        tier: 2, // Referred members are tier 2
    };

    const edgeRef = await db.collection('edges').add(newEdge);

    return { referralToken, edgeId: edgeRef.id };
});


// Function to add a participant via referral token
exports.joinBubble = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to join a bubble.');
    }

    const { uid, email, displayName } = context.auth;
    const { referralToken } = data;

    const edgesRef = db.collection('edges');
    const query = edgesRef.where('referralToken', '==', referralToken).where('accepted', '==', false);

    const snapshot = await query.get();

    if (snapshot.empty) {
        throw new functions.https.HttpsError('not-found', 'Invalid referral token.');
    }

    const edgeDoc = snapshot.docs[0];
    const edgeData = edgeDoc.data();

    // Create a new node for the participant
    const newNode = {
        ownerId: uid,
        name: displayName || email,
        status: 'Safe',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        type: 'Passive', // Participants are passive nodes
        tier: edgeData.tier,
    };

    await db.collection('nodes').doc(uid).set(newNode);

    // Update the edge to link the new node and mark as accepted
    await edgeDoc.ref.update({
        toNode: uid,
        accepted: true,
    });

    return { success: true, bubbleId: edgeData.fromNode };
});

// Function to broadcast status updates to all connected nodes
exports.updateStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to update your status.');
    }

    const { uid } = context.auth;
    const { status } = data;

    if (!['Safe', 'Busy', 'Offline', 'Help'].includes(status)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid status.');
    }

    await db.collection('nodes').doc(uid).update({
        status: status,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
});

// Function to upgrade a participant to a bubble owner
exports.upgradeToOwner = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to upgrade your account.');
    }

    const { uid } = context.auth;

    await db.collection('nodes').doc(uid).update({
        type: 'Active',
        tier: 1,
    });

    return { success: true };
});

// RevenueCat Webhook Handler
exports.revenueCatWebhook = functions.https.onRequest(async (req, res) => {
    // TODO: Use Firebase Environment Configuration for the secret
    // For local development, you might set this directly or via a local environment variable.
    // For deployment, set this using Firebase Environment Configuration:
    // firebase functions:config:set revenuecat.webhook_secret="YOUR_REVENUECAT_WEBHOOK_SECRET"
    const REVENUECAT_WEBHOOK_SECRET = functions.config().revenuecat.webhook_secret; 

    if (!REVENUECAT_WEBHOOK_SECRET) {
        console.error("REVENUECAT_WEBHOOK_SECRET is not set in Firebase Environment Configuration.");
        return res.status(500).send("Server configuration error.");
    }

    // Validate webhook secret
    const sentSecret = req.headers['x-revenuecat-webhook-secret'];
    if (sentSecret !== REVENUECAT_WEBHOOK_SECRET) {
        console.warn("Unauthorized RevenueCat webhook access attempt.");
        return res.status(401).send("Unauthorized");
    }

    // Only process POST requests
    if (req.method !== 'POST') {
        return res.status(405).send("Method Not Allowed");
    }

    const event = req.body.event;

    if (!event) {
        return res.status(400).send("No event data in webhook payload.");
    }

    try {
        const appUserId = event.app_user_id;
        const entitlements = event.entitlements;

        if (!appUserId) {
            console.warn("RevenueCat webhook: Missing app_user_id in event.");
            return res.status(400).send("Missing app_user_id");
        }

        const userRef = db.collection('nodes').doc(appUserId);

        // Check if 'premium' entitlement is active
        const isPremium = entitlements && entitlements.premium && entitlements.premium.active;

        let newTier = 2; // Default to non-premium tier (e.g., participant)
        if (isPremium) {
            newTier = 1; // Premium tier (e.g., owner)
        }

        await userRef.update({
            tier: newTier,
            revenueCatEntitlement: isPremium ? 'premium' : null, // Store active entitlement
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`User ${appUserId} tier updated to: ${newTier} (Premium: ${isPremium})`);
        return res.status(200).send("Webhook received and processed.");

    } catch (error) {
        console.error("Error processing RevenueCat webhook:", error);
        return res.status(500).send("Internal Server Error");
    }
});