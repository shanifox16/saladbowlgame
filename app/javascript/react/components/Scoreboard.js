import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export const Scoreboard = (props) => {
  const [timer, setTimer] = useState(0)
  const [secondsRemaining, setSecondsRemaining] = useState(60000)
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
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))

    const timeout = setTimeout(() => {
      setTimer(timer + 1);
    }, 3000)
    // }, 500)
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
    window.location.href = `/game/${url}${redirectPath}`
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
      <div>{player.name}</div>
    )
  })

  const redTeamPlayerList = redTeam.map(player => {
    return (
      <div>{player.name}</div>
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

  const formatSecondsRemaining = () => {
    let seconds = secondsRemaining/1000
    if (seconds < 60 && seconds > 9) {
      return `:${seconds}`
    } else if (seconds <= 9 && seconds > 1) {
      return `:0${seconds}`
    } else if (seconds === 60) {
      return "1:00"
    } else if (seconds <= 1) {
      return ":00"
    } else {
      return `1:${seconds-60}`
    }
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
                  {/* <th><span className="small-text">Time</span><br/>{formatSecondsRemaining()}</th> */}
                  <th colspan="3"><span className="small-text">Names Left</span><br/>{entriesLeftInRound}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ROUND 1</td>
                  <td className={getCurrentTeamRound() === "R1" ? "R1" : ""}><span className="small-text">Red</span><br/>{redScoreRoundOne}</td>
                  <td className={getCurrentTeamRound() === "B1" ? "B1" : ""}><span className="small-text">Blue</span><br/>{blueScoreRoundOne}</td>
                </tr>
                <tr>
                  <td>ROUND 2</td>
                  <td className={getCurrentTeamRound() === "R2" ? "R2" : ""}>{redScoreRoundTwo}</td>
                  <td className={getCurrentTeamRound() === "B2" ? "B2" : ""}>{blueScoreRoundTwo}</td>
                </tr>
                <tr>
                  <td>ROUND 3</td>
                  <td className={getCurrentTeamRound() === "R3" ? "R3" : ""}>{redScoreRoundThree}</td>
                  <td className={getCurrentTeamRound() === "B3" ? "B3" : ""}>{blueScoreRoundThree}</td>
                </tr>
                <tr>
                  <td>TOTAL</td>
                  <td>{redScoreTotal}</td>
                  <td>{blueScoreTotal}</td>
                </tr>
              </tbody>
            </table>
          </span>
        )}

        <br />
        {currentRound !== 4 && (
          <form onSubmit={myTurn}>
            <input type="submit" className="submit-button" value="My Turn" />
          </form>
        )}
        <br />
        {currentRound !== 0 && (
          <span>
            {playerTable}
          </span>
        )}
      </div>
    </div>
  )
}

export default Scoreboard
