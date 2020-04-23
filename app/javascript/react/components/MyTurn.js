import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import Countdown from 'react-countdown';

let turnLength = 10000
let remainingTime = turnLength
let time

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
              setTimesUp(true)
            } else {
              alert("Yikes, we couldn't record your answer. That's our bad.")
            }
          })
          .catch(error => console.error(`Error in fetch: ${error.message}`))
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
    } else if (skippedAnswers.length > 0) {
      setEntries(skippedAnswers)
      setSkippedAnswers([])
      getRandomEntry(skippedAnswers)
    } else {
      setTimesUp(true)
    }
  }

  const timeFormat = ({ seconds, completed }) => {
    if (completed) {
      return <span>Time's Up!</span>
    } else {
      return <span>:{seconds}</span>;
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
    setTimesUp(true)
  }

  if (timesUp) {
    return <Redirect to="/scoreboard" />
  }

  return (
    <div>
      {!gameStarted && (
        <form onSubmit={handleStart}>
          <input type="submit" value="START" />
        </form>
      )}
      {gameStarted && currentEntry && (
        <span>
          <Countdown
            start={startTimer}
            onTick={saveSecondsRemaining}
            onComplete={timesUpFunction}
            date={time}
            renderer={timeFormat}
          />
          <p>{currentEntry.name}</p>

          <form onSubmit={handleCorrect}>
            <input type="submit" value="Got it! Next Word" />
          </form>
          <form onSubmit={handleSkip}>
            <input type="submit" value="Skip! Next Word" />
          </form>
        </span>
      )}
    </div>
  )
}

export default MyTurn
