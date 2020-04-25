import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import Countdown from 'react-countdown';

let turnLength = 59000
let remainingTime = turnLength
let time
let correct = 0

export const MyTurn = (props) => {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentEntry, setCurrentEntry] = useState(null)
  const [entries, setEntries] = useState([])
  const [skippedAnswers, setSkippedAnswers] = useState([])
  const [startTimer, setStartTimer] = useState(false)
  const [pauseTimer, setPauseTimer] = useState(false)
  const [timesUp, setTimesUp] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/entries`)
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
      setEntries(entries)
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))

    fetch(`/api/v1/rounds`)
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
    .then(round => {
      if (round === 1) {
        remainingTime = turnLength
      }

    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }, [])

  const getRandomEntry = (entries) => {
    return setCurrentEntry(entries[Math.floor(Math.random() * entries.length)])
  }

  const handleStart = event => {
    if (remainingTime <= 1000) {
      remainingTime = turnLength
    }
    time = Date.now() + remainingTime
    event.preventDefault()
    setGameStarted(true)
    getRandomEntry(entries)
    setStartTimer(true)
  }

  const handleCorrect = event => {
    event.preventDefault()
    fetch(`/api/v1/entries/${currentEntry.id}`, {
      credentials: "same-origin",
      method: 'PATCH',
      body: JSON.stringify(currentEntry),
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
        correct += 1
        let entryList = entries.filter(entry => entry.id !== currentEntry.id)
        if (entryList.length > 0) {
          setEntries(entryList)
          getRandomEntry(entryList)
        } else if (skippedAnswers.length > 0) {
          setEntries(skippedAnswers)
          setSkippedAnswers([])
          getRandomEntry(skippedAnswers)
        } else {
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
              if (body.number === 4) {
                remainingTime = turnLength
              }
              correct = 0
              setTimesUp(true)
            } else {
              alert("Yikes, we couldn't record your answer. That's our bad.")
            }
          })
          .catch(error => console.error(`Error in fetch: ${error.message}`))
          correct = 0
          setTimesUp(true)
        }
      } else {
        alert("Yikes, we couldn't record your answer. That's our bad.")
      }
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))

  }

  const handleSkip = event => {
    event.preventDefault()
    setSkippedAnswers([...skippedAnswers, currentEntry])
    let entryList = entries.filter(entry => entry.id !== currentEntry.id)
    if (entryList.length > 0) {
      setEntries(entryList)
      getRandomEntry(entryList)
    } else {
      setEntries([...skippedAnswers, currentEntry])
      setSkippedAnswers([])
      getRandomEntry([...skippedAnswers, currentEntry])
    }
  }

  const timeFormat = ({ seconds, completed }) => {
    if (completed) {
      return <p className="countdown-timer">Time's Up!</p>
    } else {
      return <p className="countdown-timer">:{seconds}</p>;
    }
  }

  const timesUpFunction = () => {
    fetch('/api/v1/teams/1', {
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
        correct = 0
        setTimesUp(true)
      } else {
        alert("Yikes, we couldn't record your answer. That's our bad.")
      }
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }

  const saveSecondsRemaining = () => {
    remainingTime -= 1000
  }

  if (gameStarted && entries.length === 0 && timesUp === false) {
    correct = 0
    setTimesUp(true)
  }

  if (timesUp) {
    return <Redirect to="/scoreboard" />
  }

  return (
    <div>
      {!gameStarted && (
        <form className="start-button-container" onSubmit={handleStart}>
          <input className="submit-button start-button" type="submit" value="START" />
        </form>
      )}
      {gameStarted && currentEntry && (
        <span className="my-turn-container">
          <Countdown
            start={startTimer}
            onTick={saveSecondsRemaining}
            onComplete={timesUpFunction}
            date={time}
            renderer={timeFormat}
          />

        <p className="entry-name">{currentEntry.name}</p>

          <div className="turn-buttons row">
            <button onClick={handleCorrect} type="button" className="submit-button column">Got it! Next Word</button>
            <button onClick={handleSkip} type="button" className="submit-button column">Skip! Next Word</button>
          </div>
          <div className="turn-buttons row">
            <div className="column"># Correct: {correct}</div>
            <div className="column"># Skipped: {skippedAnswers.length}</div>
          </div>
        </span>
      )}
    </div>
  )
}

export default MyTurn
