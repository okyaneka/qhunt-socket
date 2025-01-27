import dayjs from "dayjs";
import { Trivia } from "qhunt-lib/models/TriviaModel";
import UserChallengeModel, {
  UserChallengeResult,
  UserChallengeStatus,
} from "qhunt-lib/models/UserChallengeModel";
import UserTriviaModel, {
  UserTrivia,
  UserTriviaResult,
} from "qhunt-lib/models/UserTriviaModel";
import { ChallengeService, UserChallengeService } from "qhunt-lib/services";
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
    correctBonus: 0,
    correctCount: 0,
    startAt: new Date(),
    endAt: null,
  };
};

const ChallengeSocket = socket.listen(async (socket) => {
  const id = socket.handshake.query.id as string;
  const TID = socket.auth?.code;
  if (!id || !TID) return socket.disconnect(true);

  const challenge = await UserChallengeService.detail(id, TID);
  const contents = await UserChallengeService.detailContent(id, TID);
  const contentsOrigin = await ChallengeService.detailContent(
    challenge.challenge.id
  );

  const challengeResults = challenge.results ?? initResult();

  const timerLeft =
    challenge.settings.duration -
    dayjs().diff(challengeResults.startAt, "second");

  const session: TriviaSession = {
    current: 0,
    trivia: null,
    triviaOrigin: null,
    questionSentAt: null,
    timer: timerLeft < 0 ? 0 : timerLeft,
    interval: null,
  };

  const saveState = async () => {
    const challenge = await UserChallengeService.detail(id, TID);
    if (challenge.status !== UserChallengeStatus.Completed)
      await UserChallengeModel.updateOne(
        { _id: challenge.id },
        { results: challengeResults, status: UserChallengeStatus.OnGoing }
      );
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
    const { trivia, triviaOrigin, questionSentAt } = session;
    if (!triviaOrigin || !trivia)
      return socket.emit("error", "Trivia not found");
    const answer = triviaOrigin?.options.find(({ text }) => text == value);
    if (!answer) return socket.emit("error", "Answer not found");
    const bonus = formula.triviaBonus(
      dayjs(questionSentAt).diff(dayjs(), "second")
    );

    const results: UserTriviaResult = {
      baseScore: answer.point,
      feedback:
        triviaOrigin.feedback[answer.isCorrect ? "positive" : "negative"],
      isCorrect: answer.isCorrect,
      totalScore: answer.point + (answer.isCorrect ? bonus : 0),
      bonus,
      answer: value,
    };

    await UserTriviaModel.updateOne({ _id: trivia.id }, { results });

    setScore(results.baseScore);
    if (value != undefined) setFeedback(results.feedback);
    session.current++;
    if (session.current < contents.length) setQuestion();
    else setResult();
  };

  const setQuestion = () => {
    const trivia = contents[session.current];
    if (trivia?.results) {
      ++session.current == contentsOrigin.length ? setResult() : setQuestion();
      return;
    }

    session.trivia = trivia;
    session.triviaOrigin =
      contentsOrigin.find((item) => item.id == session.trivia?.trivia.id) ||
      null;
    session.questionSentAt = new Date();
    setProgress();
    socket.emit("setQuestion", session.trivia);
  };

  const setFeedback = (value: string) => {
    socket.emit("setFeedback", value);
  };

  const setResult = async () => {
    const challenge = await UserChallengeService.detail(id, TID);
    if (challenge.status == UserChallengeStatus.Completed)
      return socket.emit("setResult", challenge.results, false);

    if (session.interval) {
      clearInterval(session.interval);
      session.interval = null;
    }

    const contents = await UserChallengeService.detailContent(id, TID);
    await Promise.all(
      contents
        .filter((item) => item.results == null)
        .map(async (item) => {
          const triviaOrigin = contentsOrigin.find(
            (item) => item.id == session.trivia?.trivia.id
          );
          if (!triviaOrigin) return;
          const results: UserTriviaResult = {
            baseScore: 0,
            feedback: triviaOrigin?.feedback.negative,
            isCorrect: false,
            totalScore: 0,
            bonus: 0,
            answer: undefined,
          };

          return await UserTriviaModel.updateOne({ _id: item.id }, { results });
        })
    );
    const { baseScore } = challengeResults;

    const { correctBonus, correctCount } = contents.reduce(
      (acc, item) => {
        acc.correctCount += item.results?.isCorrect ? 1 : 0;
        acc.correctBonus += item.results?.bonus || 0;
        return acc;
      },
      {
        correctBonus: 0,
        correctCount: 0,
      }
    );

    const timeUsed = dayjs().diff(dayjs(challengeResults.startAt), "seconds");
    const bonus = formula.timeBonus(timeUsed, challenge.settings.duration, 500);
    const totalScore = baseScore + bonus + correctBonus;

    challengeResults.bonus = bonus;
    challengeResults.timeUsed = timeUsed;
    challengeResults.correctBonus = correctBonus;
    challengeResults.correctCount = correctCount;
    challengeResults.totalScore = totalScore;
    challengeResults.endAt = new Date();

    await UserChallengeModel.updateOne(
      { _id: challenge.id },
      { results: challengeResults, status: UserChallengeStatus.Completed }
    );

    socket.emit("setResult", challengeResults, true);
  };

  const setScore = async (value: number = 0) => {
    challengeResults.baseScore += value;
    if (value != undefined) {
    } else {
      const contents = await UserChallengeService.detailContent(id, TID);
      const baseScore = contents.reduce(
        (acc, item) => acc + (item.results?.baseScore ?? 0),
        0
      );
      challengeResults.baseScore = baseScore;
    }
    await UserChallengeModel.updateOne(
      { _id: challenge.id },
      { results: challengeResults }
    );
    socket.emit("setScore", challengeResults.baseScore);
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

  if (challenge.status == UserChallengeStatus.Completed) {
    setResult();
  } else {
    await saveState();
    setTimer();
    setQuestion();
    setScore();
  }
});

export default ChallengeSocket;
