import React from 'react'
import Countdown from 'react-countdown';

const MidgameScoreboard = props => {
  const { currentTeam, currentRound, entriesLeftInRound, redScoreRoundOne, blueScoreRoundOne, redScoreRoundTwo, blueScoreRoundTwo, redScoreRoundThree, blueScoreRoundThree, redScoreTotal, blueScoreTotal, turnInProgress, secondsRemaining, onTickFunction, scoreboardTime, timeFormat } = props

  const renderCountdown = () => {
    if (!turnInProgress && secondsRemaining !== 1000) {
      if (secondsRemaining < 60000 && secondsRemaining > 9000) {
        return <p className="scoreboard-header scoreboard-timer">:{secondsRemaining/1000}</p>
      } else if (secondsRemaining < 60000) {
        return <p className="scoreboard-header scoreboard-timer">:0{secondsRemaining/1000}</p>
      } else {
        return <p className="scoreboard-header scoreboard-timer">01:00</p>
      }
    }
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

  return (
    <table className="score-table cell small-12 medium-6 large-4">
      <thead>
        <tr>
          <th className={currentTeam === "Red" ? "timer-red" : "timer-blue"} colSpan="2">
            <span className="small-text half-column beige-text">Time</span><br/>
            {renderCountdown()}
          </th>
          <th><span className="small-text half-column">Names Left</span><br/>
            <p className="scoreboard-header">{entriesLeftInRound}</p>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="2" className="half-column small-text">Red score</td>
          <td className="half-column small-text">Blue score</td>
        </tr>
        <tr>
          <td className="small-column small-text">R1</td>
          <td className={`red-column ${getCurrentTeamRound() === "R1" ? "R1" : ""}`}>{redScoreRoundOne}</td>
          <td className={`half-column ${getCurrentTeamRound() === "B1" ? "B1" : ""}`}>{blueScoreRoundOne}</td>
        </tr>
        <tr>
          <td className="small-column small-text">R2</td>
          <td id="red-round-two-score" className={`red-column ${getCurrentTeamRound() === "R2" ? "R2" : ""}`}>{redScoreRoundTwo}</td>
          <td className={`half-column ${getCurrentTeamRound() === "B2" ? "B2" : ""}`}>{blueScoreRoundTwo}</td>
        </tr>
        <tr>
          <td className="small-column small-text">R3</td>
          <td className={`red-column ${getCurrentTeamRound() === "R3" ? "R3" : ""}`}>{redScoreRoundThree}</td>
          <td className={`half-column ${getCurrentTeamRound() === "B3" ? "B3" : ""}`}>{blueScoreRoundThree}</td>
        </tr>
        <tr>
          <td className="small-column small-text">Total</td>
          <td className="red-column">{redScoreTotal}</td>
          <td id="blue-total-score" className="half-column">{blueScoreTotal}</td>
        </tr>
      </tbody>
    </table>
  )
}

export default MidgameScoreboard
