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
  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const buzzer = new Audio("https://freesound.org/data/previews/414/414208_6938106-lq.mp3")

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
    if (event.type === "click" || (event.type === "keydown" && event.key === "Enter")) {
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
    setIsButtonDisabled(true)
    setTimeout(() => setIsButtonDisabled(false), 1000)
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
    buzzer.play()
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
        <div className="my-turn-container">
          <Countdown
            start={startTimer}
            onTick={saveSecondsRemaining}
            onComplete={timesUpFunction}
            date={time}
            renderer={timeFormat}
          />

          <div className="outer-div grid-x grid-margin-x" >
            <div className="cell large-2 medium-0 small-0"></div>
            <div className="cell large-2 medium-12 small-12 details">
              <div className="details-number">{skippedAnswers.length}</div>
              <div>skipped</div>
            </div>
            <div className="cell large-4 medium-12 small-12 entry-name">
              <div className="entry-inner-div">
                {currentEntry.name}
              </div>
              <br />
              <div className="turn-buttons">
                <button onClick={handleSkip} type="button" tabIndex="-1" className="skip-button">Skip</button>
                <button disabled={isButtonDisabled} onClick={handleCorrect} tabIndex="0" autofocus type="button" className="correct-button">Got it!</button>
              </div>
            </div>
            <div className="cell large-2 medium-12 small-12 details">
              <div className="details-number">{correct}</div>
              <div>correct</div>
            </div>
            <div className="cell large-2 medium-0 small-0"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTurn
