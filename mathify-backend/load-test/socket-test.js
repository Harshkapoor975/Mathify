module.exports = {
  connectPlayer,
  submitAnswers
};

function connectPlayer(userContext, events, done) {

  return done();
}

function submitAnswers(userContext, events, done) {

  const randomAnswer =
    Math.floor(Math.random() * 20);

  userContext.vars.socket.emit(
    "submit_answer",
    {
      roomId: "test-room",
      answer: randomAnswer
    }
  );

  return done();
}