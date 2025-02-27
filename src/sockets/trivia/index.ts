import dayjs from "dayjs";
import { UserTrivia, Trivia, UserChallengeResult } from "qhunt-lib";
import { CHALLENGE_TYPES, USER_CHALLENGE_STATUS } from "qhunt-lib/constants";
import { UserChallengeService, UserTriviaService } from "qhunt-lib/services";
import { socket } from "~/helpers";
import formula from "~/helpers/formula";

interface TriviaSession {
  current: number;
  trivia: UserTrivia | null;
  triviaOrigin: Trivia | null;
  questionSentAt: Date | null;
  timer: number | null;
  interval: NodeJS.Timeout | null;
}

const initResult = (): UserChallengeResult => {
  return {
    baseScore: 0,
    bonus: 0,
    timeUsed: 0,
    totalScore: 0,
    contentBonus: 0,
    totalItem: 0,
    startAt: new Date(),
    endAt: null,
  };
};

const TriviaSocket = socket.listen(async (socket) => {
  const id = socket.handshake.query.id as string;
  if (!id) throw new Error("invalid id");

  const TID = socket.auth?.code;
  if (!TID) throw new Error("invalid auth");

  const challenge = await UserChallengeService.detail(id, TID);
  if (challenge.status === USER_CHALLENGE_STATUS.Undiscovered)
    throw new Error("challenge undiscovered");

  if (challenge.settings.type !== CHALLENGE_TYPES.Trivia)
    throw new Error("challenge type is not trivia");

  const contents = await UserTriviaService.details(challenge.contents, TID);
  const initResults = challenge.results ?? initResult();

  const timerLeft =
    challenge.settings.duration - dayjs().diff(initResults.startAt, "second");

  const session: TriviaSession = {
    current: 0,
    trivia: null,
    triviaOrigin: null,
    questionSentAt: null,
    timer: timerLeft < 0 ? 0 : timerLeft,
    interval: null,
  };

  const saveState = async () => {
    UserChallengeService.submit(id, TID);
  };

  /**
   * events
   * 1. setQuestion
   * 2. setFeedback
   * 3. setResult
   * 4. setScore
   * 5. setTimer
   * 6. setProgress
   */

  const setAnswer = async (value?: string) => {
    const { trivia, questionSentAt } = session;
    if (!trivia) return socket.emit("error", "trivia not found");
    const bonus = formula.triviaBonus(
      dayjs(questionSentAt).diff(dayjs(), "second")
    );
    const { results } = await UserTriviaService.submit(
      trivia.id,
      TID,
      value,
      bonus
    );
    setScore();
    if (results?.feedback) setFeedback(results.feedback);
    session.current++;
    setQuestion();
  };

  const setQuestion = () => {
    if (session.current === contents.length) {
      setResult();
      return;
    }

    const trivia = contents[session.current];
    if (trivia?.results) {
      session.current++;
      return setQuestion();
    }

    session.trivia = trivia;
    session.questionSentAt = new Date();
    setProgress();
    socket.emit("setQuestion", session.trivia);
  };

  const setFeedback = (value: string) => {
    if (value) socket.emit("setFeedback", value);
  };

  const setResult = async () => {
    const challenge = await UserChallengeService.detail(id, TID);
    if (challenge.status == USER_CHALLENGE_STATUS.Completed)
      return socket.emit("setResult", challenge.results, false);

    if (session.interval) {
      clearInterval(session.interval);
      session.interval = null;
    }

    const { userStage, results } = await UserChallengeService.submit(
      id,
      TID,
      undefined,
      true
    );
    socket.emit("setResult", results, true);
  };

  const setScore = async () => {
    const { results } = await UserChallengeService.submit(id, TID);
    socket.emit("setScore", results?.baseScore || 0);
  };

  const setTimer = () => {
    const doIt = () => {
      if (session.timer === 0 && session.interval !== null) {
        setResult();
      } else if (session.timer != null && session.timer > 0) {
        socket.emit("setTimer", session.timer--);
      }
    };
    doIt();
    session.interval = setInterval(doIt, 1e3);
  };

  const setProgress = () => {
    socket.emit("setProgress", `${session.current + 1}/${contents.length}`);
  };

  /**
   * listeners
   * 1. setAnswer
   */

  socket.on("setAnswer", (value: string) => {
    setAnswer(value);
  });

  socket.on("disconnect", (reason) => {
    saveState();
  });

  if (challenge.status == USER_CHALLENGE_STATUS.Completed) {
    setResult();
  } else {
    await saveState();
    setTimer();
    setQuestion();
    setScore();
  }
});

export default TriviaSocket;
