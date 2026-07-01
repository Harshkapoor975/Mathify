const USER_STATES = {
    CONNECTED: "Connected",
    RECONNECTING: "Reconnecting",
    DISCONNECTED: "Disconnected",
    ABORTED: "Aborted"
};

const RECONNECTING_MS = 15_000;
const ABORT_MS = 30_000;
let activeSessions = 0 ;

const userSessions = new Map();

function clearSessionTimers(session) {
    if (session?.disconnectTimer) {
        clearTimeout(session.disconnectTimer);
    }

    if (session?.abortTimer) {
        clearTimeout(session.abortTimer);
    }

    if (session) {
        session.disconnectTimer = null;
        session.abortTimer = null;
    }
}

function getUserSession(userId) {
    return userSessions.get(userId);
}

function connectUserSession({
    userId,
    socketId,
    roomId = null,
    isGuest = false
}) {
    const previous = userSessions.get(userId);

    // if (!previous) {
    //     session = {
    //         userId,
    //         socketId,
    //         roomId,
    //         state: USER_STATES.CONNECTED,
    //         isGuest,
    //         disconnectedAt: null,
    //         disconnectTimer: null,
    //         abortTimer: null
    //     };

    //     userSessions.set(userId, session);
    //     return session;
    // }

    clearSessionTimers(previous);


    // for memory optimization
    // previous.socketId = socketId ;
    // previous.roomId = roomId ?? previous?.roomId ?? null ;
    // previous.state = USER_STATES.CONNECTED ;
    // previous.disconnectTimer = null ;
    // previous.abortTimer = null ;
    // previous.disconnectedAt = null ;

    const session = {
        userId,
        socketId,
        roomId: roomId ?? previous?.roomId ?? null,
        state: USER_STATES.CONNECTED,
        isGuest,
        disconnectedAt: null,
        disconnectTimer: null,
        abortTimer: null
    };

    userSessions.set(userId, session);
    return previous;
}

function setUserRoom(userId, roomId) {
    const session = userSessions.get(userId);

    if (!session) {
        return null;
    }

    session.roomId = roomId;
    return session;
}

function markUserReconnecting(userId, callbacks = {}) {
    const session = userSessions.get(userId);

    if (!session || session.state === USER_STATES.ABORTED) {
        return null;
    }

    clearSessionTimers(session);

    session.state = USER_STATES.RECONNECTING;
    session.disconnectedAt = Date.now();
    session.socketId = null;

    session.disconnectTimer = setTimeout(() => {
        session.state = USER_STATES.DISCONNECTED;
        callbacks.onDisconnected?.(session);
    }, RECONNECTING_MS);
    session.disconnectTimer.unref?.();

    session.abortTimer = setTimeout(() => {
        session.state = USER_STATES.ABORTED;
        callbacks.onAborted?.(session);
    }, ABORT_MS);
    session.abortTimer.unref?.();

    return session;
}

function abortUserSession(userId) {
    const session = userSessions.get(userId);

    if (!session) {
        return null;
    }

    clearSessionTimers(session);
    session.state = USER_STATES.ABORTED;
    session.socketId = null;
    return session;
}

function removeUserSession(userId) {
    const session = userSessions.get(userId);
    clearSessionTimers(session);
    userSessions.delete(userId);
}

function getActiveSessionsCount(){
    return userSessions.size ;
}

module.exports = {
    USER_STATES,
    RECONNECTING_MS,
    ABORT_MS,
    userSessions,
    getUserSession,
    connectUserSession,
    setUserRoom,
    markUserReconnecting,
    abortUserSession,
    removeUserSession,
    getActiveSessionsCount
};
