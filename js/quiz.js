// Quiz room helpers shared by the Quiz Arena lobby and the live match page.
// Requires quiz-questions.js and firebase-config.js.

function pickRandomQuestions(count) {
    const pool = [...QUIZ_QUESTION_BANK];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
}

function createRoomCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

// Firestore document for a new room: `player` takes slot A and waits for an opponent.
function newQuizRoom({ mode, course, questionCount, player }) {
    return {
        status: 'waiting',
        mode,
        course,
        players: [player],
        scores: { A: 0, B: 0 },
        questions: pickRandomQuestions(questionCount),
        currentQuestionIndex: -1,
        currentAnswers: { A: null, B: null },
        questionStartedAt: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: player.email
    };
}
