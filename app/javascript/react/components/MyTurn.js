import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import Countdown from 'react-countdown';

let turnLength = 60000
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
  const startingSound = new Audio("https://freesound.org/data/previews/368/368691_4930962-lq.mp3")
  const gotItSound = new Audio("https://freesound.org/data/previews/126/126418_1666767-lq.mp3")
  const roundCompleteSound = new Audio("https://freesound.org/data/previews/270/270404_5123851-lq.mp3")
  const url = props.match.params.url
  const [muteAudio, setMuteAudio] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/games/${url}/entries`)
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

    fetch(`/api/v1/games/${url}/rounds`)
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
        fetch(`/api/v1/games/${url}`, {
          credentials: "same-origin",
          method: 'PATCH',
          body: JSON.stringify({"remainingTime": remainingTime}),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .catch(error => console.error(`Error in fetch: ${error.message}`))
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
    if (!muteAudio) {
      startingSound.play()
    }
    time = Date.now() + remainingTime
    console.log(`Time to send as countdownTime: ${time}`)
    fetch(`/api/v1/games/${url}`, {
      credentials: "same-origin",
      method: 'PATCH',
      body: JSON.stringify({
        "remainingTime": remainingTime,
        "turnInProgress": true,
        "countdownTime": time
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
    .then(response => response.json())
    .catch(error => console.error(`Error in fetch: ${error.message}`))
    event.preventDefault()
    setGameStarted(true)
    getRandomEntry(entries)
    setStartTimer(true)
  }

  const handleCorrect = event => {
    event.preventDefault()
    if (!muteAudio) {
      gotItSound.play()
    }
    if (event.type === "click" || (event.type === "keydown" && event.key === "Enter")) {
      fetch(`/api/v1/games/${url}/entries/${currentEntry.id}`, {
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
                fetch(`/api/v1/games/${url}`, {
                  credentials: "same-origin",
                  method: 'PATCH',
                  body: JSON.stringify({
                    "remainingTime": remainingTime,
                    "turnInProgress": false
                  }),
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                  }
                })
                .then(response => response.json())
                .catch(error => console.error(`Error in fetch: ${error.message}`))
                if (!muteAudio) {
                  roundCompleteSound.play()
                }
                correct = 0
                setTimeout(() => setTimesUp(true), 1000)
              } else {
                alert("Yikes, we couldn't record your answer. That's our bad.")
              }
            })
            .catch(error => console.error(`Error in fetch: ${error.message}`))
            correct = 0
            setTimeout(() => setTimesUp(true), 1000)
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
    setIsButtonDisabled(true)
    setTimeout(() => setIsButtonDisabled(false), 1000)
  }

  const timeFormat = ({ minutes, seconds, completed }) => {
    if (completed) {
      return <p className="countdown-timer">Time's Up!</p>
    } else if (seconds < 10) {
      return <p className="countdown-timer countdown-timer-red">0{minutes}:0{seconds}</p>
    } else {
      return <p className="countdown-timer">0{minutes}:{seconds}</p>
    }
  }

  const timesUpFunction = () => {
    if (!muteAudio) {
      buzzer.play()
    }
    fetch(`/api/v1/games/${url}/teams/1`, {
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
        setTimeout(() => setTimesUp(true), 2000)
      } else {
        alert("Yikes, we couldn't record your answer. That's our bad.")
      }
    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
    fetch(`/api/v1/games/${url}`, {
      credentials: "same-origin",
      method: 'PATCH',
      body: JSON.stringify({
        "remainingTime": remainingTime,
        "turnInProgress": false
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
    .then(response => response.json())
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }

  const saveSecondsRemaining = () => {
    // Remove line 243 when commenting back in the fetch
    remainingTime -= 1000
    // fetch(`/api/v1/games/${url}`, {
    //   credentials: "same-origin",
    //   method: 'PATCH',
    //   body: JSON.stringify({"remainingTime": remainingTime-1000}),
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json"
    //   }
    // })
    // .then(response => response.json())
    // .then(response => {
    //   remainingTime -= 1000
    // })
    // .catch(error => console.error(`Error in fetch: ${error.message}`))
  }

  // if (gameStarted && entries.length === 0 && timesUp === false) {
  //   correct = 0
  //   setTimesUp(true)
  // }

  if (timesUp) {
    // setTimeout(() => window.location.href = `/game/${url}/scoreboard`, 1500)
    return <Redirect to={`/game/${url}/scoreboard`} />
  }

  return (
    <span>
      <div></div>
      <div>
        {!gameStarted && (
          <div>
            <form className="start-button-container" onSubmit={handleStart}>
              <input className="submit-button start-button" type="submit" value="START" />
              {!muteAudio && (
                <div>
                  <i className="fas fa-volume-up" onClick={() => setMuteAudio(true)}></i>
                </div>
              )}
              {muteAudio && (
                <div>
                  <i className="fas fa-volume-mute" onClick={() => setMuteAudio(false)}></i>
                </div>
              )}
            </form>
          </div>
        )}
        {gameStarted && currentEntry && (
          <div className="my-turn-container">
            <Countdown
              start={startTimer}
              key={1}
              onTick={saveSecondsRemaining}
              onComplete={timesUpFunction}
              date={time}
              renderer={timeFormat}
            />

            <div className="outer-div grid-x grid-margin-x" >
              <div className="cell large-3 medium-12 small-12 details left-details">
                <div className="details-number left-details-number">{skippedAnswers.length}</div>
                <div>skipped</div>
              </div>
              <div className="cell large-4 medium-12 small-12 entry-name">
                <div className="entry-inner-div">
                  {currentEntry.name}
                </div>
                <br />
                <div className="turn-buttons">
                  <button disabled={isButtonDisabled} onClick={handleSkip} type="button" tabIndex="-1" className="skip-button">Skip</button>
                  <button disabled={isButtonDisabled} onClick={handleCorrect} tabIndex="0" autofocus type="button" className="correct-button">Got it!</button>
                </div>
              </div>
              <div className="cell large-3 medium-12 small-12 details right-details">
                <div className="details-number right-details-number">{correct}</div>
                <div>correct</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </span>
  )
}

export default MyTurn
