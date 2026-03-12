require('dotenv').config();
const express = require('express');
const router = express.Router();
const driver = require('../db/neo4j.js');

router.get('/test', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            'RETURN $message AS message',
            { message: 'Hello from Neo4j!' }
        );

        const record = result.records[0];
        res.send({ message: record.get('message') });
    } catch (error) {
        console.error('Neo4j error:', error);
        res.status(500).send({ error: 'Database error' });
    } finally {
        await session.close();
    }
});

router.delete('/remove-friend/:currentUserID/:otherUserID', async (req, res) => {
    const session = driver.session();
    const currentUserID = req.params.currentUserID;
    const otherUserID = req.params.otherUserID;

    if (!currentUserID || !otherUserID) {
        return res.status(400).json({ error: 'currentUserID and otherUserID are required' });
    }

    try {
        const result = await session.run(
            `
                MATCH (a:User {userid: $currentUserID})-[r:FRIENDS]-(b:User {userid: $otherUserID})
                WITH r
                LIMIT 1
                DELETE r
                RETURN r IS NOT NULL AS flag
                `,
            { currentUserID, otherUserID }
        );

        res.status(201).json({
            message: 'Friend removed',
            flag: result.records[0].get('flag'),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove friend' });
    } finally {
        await session.close();
    }
});

router.post('/send-friend-request', async (req, res) => {
    const session = driver.session();
    const { fromUserID, toUserID } = req.body;

    console.log(fromUserID);
    console.log(toUserID);

    if (!fromUserID || !toUserID) {
        return res.status(400).json({ error: 'fromUserId and toUserId are required' });
    }

    try {
        const unacceptedReqFlag = await session.run(
            `
            MATCH (me:User {userid: $fromUserID})-[:FRIEND_REQUEST]->(other:User {userid: $toUserID})
            RETURN COUNT(*) > 0 AS alreadyRequested
            `,
            { fromUserID, toUserID }
        );

        // determine boolean value from record
        const alreadyRequested = unacceptedReqFlag.records[0].get('alreadyRequested');

        if (alreadyRequested) {
            console.log("canceling");
            // Cancel an outgoing FRIEND_REQUEST relationship
            const result = await session.run(
                `
                MATCH (me:User {userid: $fromUserID})-[r:FRIEND_REQUEST]->(other:User {userid: $toUserID})
                DELETE r
                `,
                { fromUserID, toUserID }
            );

            res.status(201).json({
                message: 'Friend request canceled'
            });
        } else {
            // Create an outgoing FRIEND_REQUEST relationship
            console.log("creating");
            const result = await session.run(
                `
                MATCH (from:User {userid: $fromUserID})
                MATCH (to:User {userid: $toUserID})
                CREATE (from)-[:FRIEND_REQUEST]->(to)
                RETURN from, to
                `,
                { fromUserID, toUserID }
            );

            res.status(201).json({
                message: 'Friend request created',
                fromUser: result.records[0].get('from').properties,
                toUser: result.records[0].get('to').properties,
            });

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create friend request' });
    } finally {
        await session.close();
    }
});

router.get('/accept-friend-request/:currentUserID/:otherUserID', async (req, res) => {
    const session = driver.session();
    const currentUserID = req.params.currentUserID
    const otherUserID = req.params.otherUserID

    if (!currentUserID || !otherUserID) {
        return res.status(400).json({ error: 'currentUserID and otherUserID are required' });
    }

    try {
        //Create a "bi-directional" friendship (modeled with a direction but can be treated differently)
        const result = await session.run(
            `
            MATCH (a:User {userid: $currentUserID})
            MATCH (b:User {userid: $otherUserID})
            MATCH (b)-[r:FRIEND_REQUEST]->(a)
            WITH a, b, r
            DELETE r 
            MERGE (a)-[:FRIENDS]-(b)
            RETURN r IS NOT NULL AS friendshipCreated
            `,
            { currentUserID, otherUserID }
        );

        const friendshipCreated = result.records[0].get('friendshipCreated');

        res.status(201).json({ flag: friendshipCreated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create friend request' });
    } finally {
        await session.close();
    }
});

router.get('/friend-request-status/:fromUserID/:toUserID', async (req, res) => {
    const session = driver.session();
    // Get req have no body, req.params makes vars into strings even if it was something else
    // + symbol converts to Number from string, have to match userID type in Neo4j
    const fromUserID = req.params.fromUserID
    const toUserID = req.params.toUserID

    if (!fromUserID || !toUserID) {
        return res.status(400).json({ error: 'fromUserId and toUserId are required' });
    }

    try {
        const incomingReqFlag = await session.run(
            `
            MATCH (other:User {userid: $toUserID})-[:FRIEND_REQUEST]->(current:User {userid: $fromUserID})
            RETURN COUNT(*) > 0 AS incomingRequestFlag
            `,
            { toUserID, fromUserID }
        );

        // determine boolean value from record
        const incomingRequestFlag = incomingReqFlag.records[0].get('incomingRequestFlag');

        res.status(201).json({ flag: incomingRequestFlag });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create friend request' });
    } finally {
        await session.close();
    }
});

router.get('/inc-friend-request-status/:fromUserID/:toUserID', async (req, res) => {
    const session = driver.session();
    // Get req have no body, req.params makes vars into strings even if it was something else
    // + symbol converts to Number from string, have to match userID type in Neo4j
    const fromUserID = req.params.fromUserID
    const toUserID = req.params.toUserID

    if (!fromUserID || !toUserID) {
        return res.status(400).json({ error: 'fromUserId and toUserId are required' });
    }

    try {
        const outgoingReqFlag = await session.run(
            `
            MATCH (other:User {userid: $fromUserID})-[:FRIEND_REQUEST]->(current:User {userid: $toUserID})
            RETURN COUNT(*) > 0 AS outgoingRequestFlag
            `,
            { toUserID, fromUserID }
        );

        // determine boolean value from record
        const outgoingRequestFlag = outgoingReqFlag.records[0].get('outgoingRequestFlag');

        res.status(201).json({ flag: outgoingRequestFlag });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create friend request' });
    } finally {
        await session.close();
    }
});

router.get('/friendship-status/:fromUserID/:toUserID', async (req, res) => {
    const session = driver.session();
    // Get req have no body, req.params makes vars into strings even if it was something else
    // + symbol converts to Number from string, have to match userID type in Neo4j
    const fromUserID = req.params.fromUserID
    const toUserID = req.params.toUserID

    if (!fromUserID || !toUserID) {
        return res.status(400).json({ error: 'fromUserId and toUserId are required' });
    }

    try {
        const friendsFlagReq = await session.run(
            `
            MATCH (current:User {userid: $fromUserID})-[:FRIENDS]-(other:User {userid: $toUserID})
            RETURN COUNT(*) > 0 AS friendsFlag
            `,
            { toUserID, fromUserID }
        );

        // determine boolean value from record
        const friendshipFlag = friendsFlagReq.records[0].get('friendsFlag');

        res.status(201).json({ flag: friendshipFlag });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check friendship stats' });
    } finally {
        await session.close();
    }
});

router.get('/getFriendReqIDs/:userID', async (req, res) => {
    const session = driver.session();
    // Get req have no body, req.params makes vars into strings even if it was something else
    // + symbol converts to Number from string, have to match userID type in Neo4j
    const userID = req.params.userID

    if (!userID) {
        return res.status(400).json({ error: 'userID is required' });
    }

    try {
        const result = await session.run(
            `
            OPTIONAL MATCH (sender:User)-[:FRIEND_REQUEST]->(target:User {userid: $userID})
            WITH collect(sender.userid) AS requestingUserIDs
            RETURN requestingUserIDs
            `,
            { userID }
        );

        const userIDs = result.records[0].get('requestingUserIDs');
        console.log(`userIDs: ${userIDs}`);

        res.status(201).json({ users: userIDs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check friendship stats' });
    } finally {
        await session.close();
    }
});

router.get('/getFriendIDs/:userID', async (req, res) => {
    const session = driver.session();
    // Get req have no body, req.params makes vars into strings even if it was something else
    // + symbol converts to Number from string, have to match userID type in Neo4j
    const userID = req.params.userID

    if (!userID) {
        return res.status(400).json({ error: 'userID is required' });
    }

    try {
        const result = await session.run(
            `
            OPTIONAL MATCH (sender:User)-[:FRIENDS]-(target:User {userid: $userID})
            WITH collect(sender.userid) AS requestingUserIDs
            RETURN requestingUserIDs
            `,
            { userID }
        );

        const userIDs = result.records[0].get('requestingUserIDs');
        console.log(`userIDs: ${userIDs}`);

        res.status(201).json({ users: userIDs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get friends ids' });
    } finally {
        await session.close();
    }
});


module.exports = router;