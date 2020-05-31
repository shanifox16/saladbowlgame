import React, { useState, useEffect, Fragment } from 'react'
import { Link, Redirect } from 'react-router-dom'
import MidgameScoreboard from "./MidgameScoreboard"

let scoreboardTime = 59000

export const Scoreboard = (props) => {
  const [timer, setTimer] = useState(0)
  const [loading, setLoading] = useState(true)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [turnInProgress, setTurnInProgress] = useState(false)
  const [redScoreRoundOne, setRedScoreRoundOne] = useState(0)
  const [redScoreRoundTwo, setRedScoreRoundTwo] = useState(0)
  const [redScoreRoundThree, setRedScoreRoundThree] = useState(0)
  const [redScoreTotal, setRedScoreTotal] = useState(0)
  const [blueScoreRoundOne, setBlueScoreRoundOne] = useState(0)
  const [blueScoreRoundTwo, setBlueScoreRoundTwo] = useState(0)
  const [blueScoreRoundThree, setBlueScoreRoundThree] = useState(0)
  const [blueScoreTotal, setBlueScoreTotal] = useState(0)
  const [entriesLeftInRound, setEntriesLeftInRound] = useState(0)
  const [totalEntries, setTotalEntries] = useState(null)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [blueTeam, setBlueTeam] = useState([])
  const [redTeam, setRedTeam] = useState([])
  const [currentRound, setCurrentRound] = useState(1)
  const [redirectPath, setRedirectPath] = useState(null)
  const url = props.match.params.url
  const nameTerm = "name"
  const nameTerms = "names"
  const gameOverSound = new Audio("https://freesound.org/data/previews/270/270402_5123851-lq.mp3")

  useEffect(() => {
    fetch(`/api/v1/games/${url}/notifications`)
    .then(response => {
      if (response.ok) {
        return response;
      } else {
        let errorMessage = `${response.status} (${response.statusText})`,
          error = new Error(errorMessage)
        throw(error);
      }
    })
    .then(response => response.json())
    .then(data => {
      if (turnInProgress === false && data.turn_in_progress === true) {
        console.log("Changing turn in progress to true")
        console.log(`Database Time:${data.countdown_time}`)
        scoreboardTime = data.countdown_time
        setTurnInProgress(data.turn_in_progress)
      }
      if (turnInProgress === true && data.turn_in_progress === false) {
        console.log("Changing turn in progress to false")
        setTurnInProgress(data.turn_in_progress)
        location.reload()
      }

      setSecondsRemaining(data.seconds_remaining)
      setRedScoreRoundOne(data.red_score_round_one.length)
      setRedScoreRoundTwo(data.red_score_round_two.length)
      setRedScoreRoundThree(data.red_score_round_three.length)
      setRedScoreTotal(data.red_score_total)
      setBlueScoreRoundOne(data.blue_score_round_one.length)
      setBlueScoreRoundTwo(data.blue_score_round_two.length)
      setBlueScoreRoundThree(data.blue_score_round_three.length)
      setBlueScoreTotal(data.blue_score_total)
      setEntriesLeftInRound(data.entries_left_in_round)
      setTotalEntries(data.total_entries.length)
      setCurrentTeam(data.current_team)
      setCurrentRound(data.current_round)
      setBlueTeam(data.blue_team_players)
      setRedTeam(data.red_team_players)
      setLoading(false)
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))

    const timeout = setTimeout(() => {
      setTimer(timer + 1);
    }, 3000)
    return () => clearTimeout(timeout)
  }, [timer])

  const resetGame = (event) => {
    event.preventDefault()
    if (window.confirm("Are you sure you want to start a new game? All of the entries from this game will be deleted.")) {
      fetch(`/api/v1/games/${url}/notifications/reset`)
      .then(response => {
        if (response.ok) {
          return response;
        } else {
          let errorMessage = `${response.status} (${response.statusText})`,
            error = new Error(errorMessage)
          throw(error);
        }
      })
      .then(response => response.json())
      .then(entries => {
        setRedirectPath(`/form`)
      })
      .catch(error => console.error(`Error in fetch: ${error.message}`))
    }
  }

  const myTurn = (event) => {
    event.preventDefault()
    if (currentRound === 0) {
      fetch(`/api/v1/games/${url}/rounds/1`, {
        credentials: "same-origin",
        method: 'PATCH',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        if (response.ok) {
          return response;
        } else {
          let errorMessage = `${response.status} (${response.statusText})`,
           error = new Error(errorMessage);
          throw(error);
        }
      })
      .then(response => response.json())
      .then(body => {
        if (!!body.id) {
          setRedirectPath("/myturn")
        } else {
          alert("Yikes, we couldn't record your answer. That's our bad.")
        }
      })
      .catch(error => console.error(`Error in fetch: ${error.message}`))
    } else {
      setRedirectPath("/myturn")
    }
  }

  if (redirectPath) {
    return <Redirect to={`/game/${url}${redirectPath}`} />
  }

  if (totalEntries === 0) {
    window.location.href = `/game/${url}/form`
  }

  if (currentRound === 4) {
    if (redScoreTotal > blueScoreTotal && currentTeam !== "Red") {
      setCurrentTeam("Red")
    } else if (redScoreTotal < blueScoreTotal && currentTeam !== "Blue") {
      setCurrentTeam("Blue")
    }
  }

  const blueTeamPlayerList = blueTeam.map(player => {
    return (
      <div key={player.name}>{player.name}</div>
    )
  })

  const redTeamPlayerList = redTeam.map(player => {
    return (
      <div key={player.name}>{player.name}</div>
    )
  })

  const playerTable = (
    <table className="score-table cell small-12 medium-6 large-4">
      <thead>
        <tr>
          <th className="small-text">Red Team</th>
          <th className="small-text">Blue Team</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{redTeamPlayerList}</td>
          <td>{blueTeamPlayerList}</td>
        </tr>
      </tbody>
    </table>
  )

  const timeFormat = ({ minutes, seconds, completed }) => {
    if (seconds < 10) {
      return <p className="scoreboard-header scoreboard-timer">:0{seconds}</p>
    } else {
      return <p className="scoreboard-header scoreboard-timer">0{minutes}:{seconds}</p>
    }
  }

  const onTickFunction = () => {
    scoreboardTime -= 1
  }

  const myTurnButton = () => {
    if (!turnInProgress) {
      return (
        <form onSubmit={myTurn}>
          <input type="submit" className="submit-button" value="My Turn" />
        </form>
      )
    }
  }

  const roundRules = () => {
    if (currentRound === 0) {
      return (
        <span className="round-rules cell large-4 medium-12 small-12">
          <h5><strong>PREPARE FOR ROUND 1</strong></h5>
          <p>The <strong>{currentTeam}</strong> team will go first</p>
          <p>Once all players have finished submitting 5 {nameTerms}, the first player should click &quot;My Turn&quot;</p>
          <p>Use words (no hand gestures) to get your teammates to guess the {nameTerm}, without saying it yourself. Teams will alternate until all {nameTerms} have been guessed.</p>
          {myTurnButton()}
        </span>
      )
    }
    if (currentRound === 1) {
      return (
        <span className="round-rules cell large-4 medium-12 small-12">
          <h5><strong>ROUND 1</strong></h5>
          <p>Use words (no hand gestures) to get your teammates to guess the {nameTerm}, without saying it yourself. Teams will alternate until all {nameTerms} have been guessed.</p>
          {myTurnButton()}
        </span>
      )
    } else if (currentRound === 2) {
      return (
        <span className="round-rules cell large-4 medium-12 small-12">
          <h5><strong>ROUND 2</strong></h5>
          <p>In this round, the player giving clues tries to get their teammates to guess each name, without saying the name itself. They can only say <strong>one</strong> word for each clue. They can repeat the words as many times as desired (or even sing it).</p>
          {myTurnButton()}
        </span>
      )
    } else if (currentRound === 3) {
      return (
        <span className="round-rules cell large-4 medium-12 small-12">
          <h5><strong>ROUND 3</strong></h5>
          <p>Charades! (no talking allowed)</p>
          {myTurnButton()}
        </span>
      )
    } else {
      return (
        <span className="round-rules cell large-4 medium-12 small-12">
          <h5><strong>GAME OVER</strong></h5>
          {redScoreTotal === blueScoreTotal ? (
            <p>No way! It's a tie!</p>
          ): (
            <p>{redScoreTotal > blueScoreTotal ? "Red" : "Blue"} team wins!</p>
          )}
          <form onSubmit={resetGame}>
            <input type="submit" className="submit-button" value="Play Again?" />
          </form>
        </span>
      )
    }
  }

  return (
    <div>
    {loading ? (
      <Fragment>
        <div>
          <form className="reset-button-container" onSubmit={resetGame}>
            <input type="submit" className="reset-button" value="Start New Game" />
          </form>
        </div>
        <div className="scoreboard">
          <div class="grid-container">
            <div className="grid-x grid-margin-x">
              {roundRules()}
            </div>
          </div>
        </div>
      </Fragment>
    ) : (
      <Fragment>
        <div>
          <form className="reset-button-container" onSubmit={resetGame}>
            <input type="submit" className="reset-button" value="Start New Game" />
          </form>
        </div>
        <div className="scoreboard">
          <div class="grid-container">
            <div className="grid-x grid-margin-x">
              {roundRules()}
              <MidgameScoreboard
                currentTeam={currentTeam}
                entriesLeftInRound={entriesLeftInRound}
                redScoreRoundOne={redScoreRoundOne}
                blueScoreRoundOne={blueScoreRoundOne}
                redScoreRoundTwo={redScoreRoundTwo}
                blueScoreRoundTwo={blueScoreRoundTwo}
                redScoreRoundThree={redScoreRoundThree}
                blueScoreRoundThree={blueScoreRoundThree}
                redScoreTotal={redScoreTotal}
                blueScoreTotal={blueScoreTotal}
                turnInProgress={turnInProgress}
                secondsRemaining={secondsRemaining}
                onTickFunction={onTickFunction}
                scoreboardTime={scoreboardTime}
                timeFormat={timeFormat}
                currentRound={currentRound}
              />
              <Fragment>
                {playerTable}
              </Fragment>
            </div>
          </div>
        </div>
      </Fragment>
    )}
    </div>
  )
}

export default Scoreboard
