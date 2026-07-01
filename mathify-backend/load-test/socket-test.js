// // // module.exports = {
// // //   connectPlayer,
// // //   submitAnswers
// // // };

// // // function connectPlayer(userContext, events, done) {

// // //   return done();
// // // }

// // // function submitAnswers(userContext, events, done) {

// // //   const randomAnswer =
// // //     Math.floor(Math.random() * 20);

// // //   userContext.vars.socket.emit(
// // //     "submit_answer",
// // //     {
// // //       roomId: "test-room",
// // //       answer: randomAnswer
// // //     }
// // //   );

// // //   return done();
// // // }
// // module.exports = {
// //   connectPlayer,
// //   submitAnswers
// // };

// // function connectPlayer(userContext, events, done) {

// //   return done();
// // }

// // function submitAnswers(userContext, events, done) {

// //   const randomAnswer =
// //     Math.floor(Math.random() * 20);

// //   userContext.vars.socket.emit(
// //     "submit_answer",
// //     {
// //       roomId: "test-room",
// //       answer: randomAnswer
// //     }
// //   );

// //   return done();
// // }
// module.exports = {
//   connectPlayer,
//   submitAnswers
// };

// // Simple arithmetic solver to calculate the correct answer
// function solveQuestion(text) {
//   if (!text) return 0;
//   const parts = text.trim().split(/\s+/);
//   if (parts.length < 3) return 0;
  
//   const a = parseInt(parts[0], 10);
//   const op = parts[1];
//   const b = parseInt(parts[2], 10);
  
//   if (op === "+") return a + b;
//   if (op === "-") return a - b;
//   if (op === "*") return a * b;
//   return 0;
// }

// function connectPlayer(userContext, events, done) {
//   const socket = userContext.socket;

//   // Listen for the start of the game
//   socket.on("game_started", (data) => {
//     userContext.vars.roomId = data.roomId;
//     userContext.vars.currentAnswer = solveQuestion(data.question);
//     userContext.vars.gameStarted = true;
//     userContext.vars.gameOver = false;
//   });

//   // Listen for progress / next questions
//   socket.on("answer_result", (data) => {
//     if (data.correct && data.nextQuestion) {
//       userContext.vars.currentAnswer = solveQuestion(data.nextQuestion);
//     }
//   });

//   socket.on("game_over", () => {
//     userContext.vars.gameOver = true;
//   });

//   return done();
// }

// function submitAnswers(userContext, events, done) {
//   // If the game hasn't started or is already over, skip submission
//   if (!userContext.vars.gameStarted || userContext.vars.gameOver) {
//     return done();
//   }

//   const socket = userContext.socket;
//   const roomId = userContext.vars.roomId;
//   const answer = userContext.vars.currentAnswer;

//   if (roomId && answer !== undefined) {
//     socket.emit("submit_answer", {
//       roomId: roomId,
//       answer: String(answer) // Convert to string as expected by the backend
//     });
//   }

//   return done();
// }
module.exports = {
  connectPlayer,
  submitAnswers
};

// Simple arithmetic solver to calculate the correct answer
function solveQuestion(text) {
  if (!text) return 0;
  const parts = text.trim().split(/\s+/);
  if (parts.length < 3) return 0;

  const a = parseInt(parts[0], 10);
  const op = parts[1];
  const b = parseInt(parts[2], 10);

  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  return 0;
}

function connectPlayer(userContext, events, done) {
  const socket = userContext.socket;

  // Listen for the start of the game
  socket.on("game_started", (data) => {
    userContext.vars.roomId = data.roomId;
    userContext.vars.currentAnswer = solveQuestion(data.question);
    userContext.vars.gameStarted = true;
    userContext.vars.gameOver = false;
  });

  // Listen for progress / next questions
  socket.on("answer_result", (data) => {
    if (data.correct && data.nextQuestion) {
      userContext.vars.currentAnswer = solveQuestion(data.nextQuestion);
    }
  });

  socket.on("game_over", () => {
    userContext.vars.gameOver = true;
  });

  return done();
}

function submitAnswers(userContext, events, done) {
  // If the game hasn't started or is already over, skip submission
  if (!userContext.vars.gameStarted || userContext.vars.gameOver) {
    return done();
  }

  const socket = userContext.socket;
  const roomId = userContext.vars.roomId;
  const answer = userContext.vars.currentAnswer;

  if (roomId && answer !== undefined) {
    socket.emit("submit_answer", {
      roomId: roomId,
      answer: String(answer) // Convert to string as expected by the backend
    });
  }

  return done();
}