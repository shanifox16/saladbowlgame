import React, { useState, useEffect } from 'react'
import { Link, Redirect } from 'react-router-dom'
import Countdown from 'react-countdown';

let scoreboardTime = 59000

export const Scoreboard = (props) => {
  const [timer, setTimer] = useState(0)
  // const [secondsRemaining, setSecondsRemaining] = useState(9000)
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
        // scoreboardTime = Date.now() + data.seconds_remaining - 1000
        scoreboardTime = data.countdown_time
        setTurnInProgress(data.turn_in_progress)
        // setSecondsRemaining(data.seconds_remaining)
      }
      if (turnInProgress === true && data.turn_in_progress === false) {
        console.log("Changing turn in progress to false")
        setTurnInProgress(data.turn_in_progress)
        location.reload()
        // setSecondsRemaining(data.seconds_remaining)
      }
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
    // window.location.href = `/game/${url}${redirectPath}`
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
    <table className="player-table">
      <thead>
        <tr>
          <th className="th-red">Red Team</th>
          <th className="th-blue">Blue Team</th>
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
    // if (completed) {
      // return <p className="countdown-timer">Time's Up!</p>
    // } else
    if (seconds < 10) {
      return <p className="countdown-timer countdown-timer-red">0{minutes}:0{seconds}</p>
    } else {
      return <p className="countdown-timer">0{minutes}:{seconds}</p>
    }
  }

  const onTickFunction = () => {
    scoreboardTime -= 1
  }

  const renderCountdown = () => {
    // let seconds = secondsRemaining/1000
    // if (seconds < 60 && seconds > 9) {
    //   return `:${seconds}`
    // } else if (seconds <= 9 && seconds > 1) {
    //   return `:0${seconds}`
    // } else if (seconds === 60) {
    //   return "1:00"
    // } else if (seconds <= 1) {
    //   return ":00"
    // } else {
    //   return `1:${seconds-60}`
    // }

    return (
      <Countdown
        start={turnInProgress}
        onTick={onTickFunction}
        key={2}
        date={scoreboardTime}
        renderer={timeFormat}
      />
    )
  }

  const getCurrentTeamRound = () => {
    if (currentTeam === "Red" && currentRound === 1) {
      return "R1"
    } else if (currentTeam === "Red" && currentRound === 2) {
      return "R2"
    } else if (currentTeam === "Red" && currentRound === 3) {
      return "R3"
    } else if (currentTeam === "Blue" && currentRound === 1) {
      return "B1"
    } else if (currentTeam === "Blue" && currentRound === 2) {
      return "B2"
    } else if (currentTeam === "Blue" && currentRound === 3) {
      return "B3"
    }
  }

  const roundRules = () => {
    if (currentRound === 1) {
      return `Use words (no hand gestures) to get your teammates to guess the ${nameTerm}, without saying it yourself. Teams will alternate until all ${nameTerms} have been guessed.`
    } else if (currentRound === 2) {
      return `You can only say one word for each ${nameTerm}. You can repeat the word as many times as desired (or even sing it)`
    } else if (currentRound === 3) {
      return "Charades! (no talking allowed)"
    }
  }

  return (
    <div>
      <div>
        <form className="reset-button-container" onSubmit={resetGame}>
          <input type="submit" className="reset-button" value="Start New Game" />
        </form>
      </div>
      <div className="scoreboard">
        {currentRound === 0 && (
          <span>
            <p>Prepare for Round 1</p>
            {playerTable}
            <p>The <strong>{currentTeam}</strong> team will go first</p>
            <p>Once all players have finished submitting 5 {nameTerms}, the first player should click &quot;My Turn&quot;</p>
            <p>Use words (no hand gestures) to get your teammates to guess the {nameTerm}, without saying it yourself. Teams will alternate until all {nameTerms} have been guessed.</p>
          </span>
        )}
        {currentRound === 4 && (
          <span>
            <p><strong>GAME OVER</strong></p>
            {redScoreTotal === blueScoreTotal ? (
              <p>No way! It's a tie!</p>
            ): (
              <p>{redScoreTotal > blueScoreTotal ? "Red" : "Blue"} team wins!</p>
            )}
          </span>
        )}
        {currentRound !== 0 && currentRound !== 4 && (
          <p title={roundRules()}>Round <strong>{currentRound}</strong> (hover for rules)</p>
        )}
        {currentRound !== 0 && (
          <span>
            <table className="score-table">
              <thead>
                <tr>
                  <th>
                    <span className="small-text">Time</span><br/>
                    {renderCountdown()}
                  </th>
                  <th><span className="small-text">Remaining</span><br/>{entriesLeftInRound}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Red score</td>
                  <td>Blue score</td>
                </tr>
                <tr>
                  <td className={getCurrentTeamRound() === "R1" ? "R1" : ""}><span className="small-text">R1</span>{redScoreRoundOne}</td>
                  <td className={getCurrentTeamRound() === "B1" ? "B1" : ""}>{blueScoreRoundOne}</td>
                </tr>
                <tr>
                  <td className={getCurrentTeamRound() === "R2" ? "R2" : ""}><span className="small-text">R2</span>{redScoreRoundTwo}</td>
                  <td className={getCurrentTeamRound() === "B2" ? "B2" : ""}>{blueScoreRoundTwo}</td>
                </tr>
                <tr>
                  <td className={getCurrentTeamRound() === "R3" ? "R3" : ""}><span className="small-text">R3</span>{redScoreRoundThree}</td>
                  <td className={getCurrentTeamRound() === "B3" ? "B3" : ""}>{blueScoreRoundThree}</td>
                </tr>
                <tr>
                  <td><span className="small-text small-right">Total</span><span className="big-center">{redScoreTotal}</span></td>
                  <td>{blueScoreTotal}</td>
                </tr>
              </tbody>
            </table>
            <span>
              {playerTable}
            </span>
          </span>
        )}

        <br />
        {currentRound !== 4 && (
          <form onSubmit={myTurn}>
            <input type="submit" className="submit-button" value="My Turn" />
          </form>
        )}
      </div>
    </div>
  )
}

export default Scoreboard
