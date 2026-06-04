const USER_STATES = {
    CONNECTED: "Connected",
    RECONNECTING: "Reconnecting",
    DISCONNECTED: "Disconnected",
    ABORTED: "Aborted"
};

const RECONNECTING_MS = 15_000;
const ABORT_MS = 30_000;

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

    clearSessionTimers(previous);

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
    return session;
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
    removeUserSession
};
