import React, { useState, useEffect } from 'react'
import { Link, Redirect } from 'react-router-dom'

export const Scoreboard = (props) => {
  const [timer, setTimer] = useState(0)
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
  }

  if (totalEntries === 0) {
    return <Redirect to={`/game/${url}/form`} />
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

  return (
    <div className={`scoreboard-${currentTeam}`}>
      {currentRound === 0 && (
        <span>
          <p>Prepare for Round 1</p>
          {playerTable}
          <p>The <strong>{currentTeam}</strong> team will go first</p>
          <p>Once all players have finished submitting 5 names, the first player should click &quot;My Turn&quot;</p>
          <p>Use words (no hand gestures) to get your teammates to guess the name, without saying the name itself. Teams will alternate until all names have been guessed.</p>
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
        <span>
          <p>Scoreboard:</p>
          <p>Current Round: <strong>{currentRound}</strong></p>
          {currentRound === 1 && (
            <p>Use words (no hand gestures) to get your teammates to guess the name, without saying the name itself. Teams will alternate until all names have been guessed.</p>
          )}
          {currentRound === 2 && (
            <p>You can can only say one word for each name. You can repeat the word as many times as desired, or even sing it.</p>
          )}
          {currentRound === 3 && (
            <p>Charades! (no talking allowed)</p>
          )}
          <p>It is <strong>{currentTeam}</strong>&apos;s turn</p>
          <p>Remaining Names: <strong>{entriesLeftInRound}</strong></p>
        </span>
      )}
      {currentRound !== 0 && (
        <span>
          {playerTable}
          <table className="score-table">
            <thead>
              <tr>
                <th></th>
                <th>Red</th>
                <th>Blue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Round 1</td>
                <td>{redScoreRoundOne}</td>
                <td>{blueScoreRoundOne}</td>
              </tr>
              <tr>
                <td>Round 2</td>
                <td>{redScoreRoundTwo}</td>
                <td>{blueScoreRoundTwo}</td>
              </tr>
              <tr>
                <td>Round 3</td>
                <td>{redScoreRoundThree}</td>
                <td>{blueScoreRoundThree}</td>
              </tr>
              <tr>
                <td>Total</td>
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
      <form className="reset-button-container" onSubmit={resetGame}>
        <input type="submit" className="submit-button reset-button" value="Reset and Start New Game" />
      </form>
    </div>
  )
}

export default Scoreboard
