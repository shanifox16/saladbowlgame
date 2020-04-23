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
  const [currentTeam, setCurrentTeam] = useState(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [redirectPath, setRedirectPath] = useState(null)

  useEffect(() => {
    fetch('/api/v1/notifications')
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
      setCurrentTeam(data.current_team)
      setCurrentRound(data.current_round)
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))

    const timeout = setTimeout(() => {
      setTimer(timer + 1);
    }, 5000)
    return () => clearTimeout(timeout)
  }, [timer])

  const resetGame = (event) => {
    event.preventDefault()
    fetch(`/api/v1/notifications/reset`)
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
      setRedirectPath("/")
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }

  const myTurn = (event) => {
    event.preventDefault()
    if (currentRound === 0) {
      fetch('/api/v1/rounds/1', {
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
    return <Redirect to={redirectPath} />
  }

  return (
    <div class={`scoreboard ${currentTeam}`}>
      {currentRound === 0 && (
        <span>
          <p>Prepare for Round 1</p>
          <p>The <strong>{currentTeam}</strong> team will go first</p>
          <p>Once all players have finished submitting 5 names, the first player should click &quot;My Turn&quot;</p>
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
          <p>It is <strong>{currentTeam}</strong>&apos;s turn</p>
          <p>Current Round: <strong>{currentRound}</strong></p>
          <p>Remaining Names: <strong>{entriesLeftInRound}</strong></p>
        </span>
      )}
      {currentRound !== 0 && (
          <table>
            <thead>
              <tr>
                <th>
                  <form onSubmit={() => window.location.reload()}>
                    <input type="submit" class="refresh-button" value="Refresh" />
                  </form>
                </th>
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
      )}

      <br />
      {currentRound !== 4 && (
        <form onSubmit={myTurn}>
          <input type="submit" class="submit-button" value="My Turn" />
        </form>
      )}
      <br />
      <form className="reset-button" onSubmit={resetGame}>
        <input type="submit" class="submit-button" value="Clear Data and Start New Game" />
      </form>
    </div>
  )
}

export default Scoreboard
