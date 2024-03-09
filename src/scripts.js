import { shuffleArray } from "./commons/common-functions";
let playerCount = 21;

export const generateTheMatchSchedule = (playerCount, playerArray) => {
  let fullMatches = []; //total match round wise
  let preRoundPlayer;
  let firstByePlayers;
  let secondRoundNoMatchPlayers;
  let roundMatchesResult = [];

  playerArray = shuffleArray(playerArray);
  //1. Get rounds with pre-round
  const nextBracketSize = Math.pow(
    2,
    Math.ceil(Math.log(playerCount) / Math.log(2))
  );

  let firsRoundBye = nextBracketSize - playerCount;
  let preRoundCount = playerCount - firsRoundBye;
  let previousBracketSize = Math.pow(
    2,
    Math.floor(Math.log(playerCount) / Math.log(2))
  );

  console.log("firsRoundBye :-", firsRoundBye);
  console.log("preRoundCount :-", preRoundCount);

  firstByePlayers = playerArray.splice(0, firsRoundBye);

  // get no of rounds.
  let rounds =
    preRoundCount > 0
      ? 1 + Math.log(previousBracketSize) / Math.log(2)
      : 0 + Math.log(previousBracketSize) / Math.log(2);

  console.log("rounds :-", rounds);
  let matchId = 1;
  for (let i = 0; i < rounds; i++) {
    if (i == 0) {
      let currentRoundMatches = [];
      preRoundPlayer = playerArray.slice(0, preRoundCount);
      for (let index = 0; index < preRoundPlayer.length / 2; index++) {
        // pre-round
        currentRoundMatches.push({
          matchId: matchId,
          player1: preRoundPlayer[index],
          player2: preRoundPlayer[preRoundPlayer.length - 1 - index],
          winner: `Winner for matchId ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }

      roundMatchesResult.push(currentRoundMatches);
      fullMatches.push(currentRoundMatches);
    } else if (firstByePlayers.length) {
      let currentRoundMatches = [];
      if (firstByePlayers.length % 2 !== 0) {
        // Remove one element to make the array even
        secondRoundNoMatchPlayers = firstByePlayers.splice(
          Math.floor(firstByePlayers.length / 2),
          1
        );
      } else {
        // Output the original array if it's already even
        console.log("Array is already even:", firstByePlayers);
      }

      for (let index = 0; index < firstByePlayers.length / 2; index++) {
        // pre-round
        currentRoundMatches.push({
          matchId: matchId,
          player1: firstByePlayers[index],
          player2: firstByePlayers[firstByePlayers.length - 1 - index],
          winner: `Winner for matchId ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }
      firstByePlayers = [];

      // pre-round winner with remaining match for second round.
      let preRoundWinnerPlayer = [
        ...roundMatchesResult[i - 1],
        ...secondRoundNoMatchPlayers,
      ];

      for (let index = 0; index < preRoundWinnerPlayer.length / 2; index++) {
        // pre-round
        currentRoundMatches.push({
          matchId: matchId,
          player1:
            typeof preRoundWinnerPlayer[index] == "string"
              ? preRoundWinnerPlayer[index]
              : preRoundWinnerPlayer[index].winner,
          player2:
            typeof preRoundWinnerPlayer[
              preRoundWinnerPlayer.length - 1 - index
            ] == "string"
              ? preRoundWinnerPlayer[preRoundWinnerPlayer.length - 1 - index]
              : preRoundWinnerPlayer[preRoundWinnerPlayer.length - 1 - index]
                  .winner,

          winner: `Winner for matchId ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }

      roundMatchesResult.push(currentRoundMatches);
      fullMatches.push(currentRoundMatches);
    } else {
      let currentRoundMatches = [];
      for (
        let index = 0;
        index < roundMatchesResult[i - 1].length / 2;
        index++
      ) {
        currentRoundMatches.push({
          matchId: matchId,
          player1:
            typeof roundMatchesResult[i - 1][index] == "string"
              ? roundMatchesResult[i - 1][index]
              : roundMatchesResult[i - 1][index].winner,
          player2:
            typeof roundMatchesResult[i - 1][
              roundMatchesResult[i - 1].length - 1 - index
            ] == "string"
              ? roundMatchesResult[i - 1][
                  roundMatchesResult[i - 1].length - 1 - index
                ]
              : roundMatchesResult[i - 1][
                  roundMatchesResult[i - 1].length - 1 - index
                ].winner,

          winner: `Winner for matchId ${matchId}`,
          round: i + 1,
        });
        matchId++;
      }
      roundMatchesResult.push(currentRoundMatches);
      fullMatches.push(currentRoundMatches);
    }
  }
  console.log(fullMatches);
};

let playerArray = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
  "player7",
  "player8",
  "player9",
  "player10",
  "player11",
  "player12",
  "player13",
  "player14",
  "player15",
  "player16",
  "player17",
  "player18",
  "player19",
  "player20",
  "player21",
];

// generateTheMatchSchedule(playerCount, playerArray);
