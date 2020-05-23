import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import _ from "lodash"
import ErrorList from "./ErrorList"
import "babel-polyfill"

export const Home = (props) => {
  const [redirectPath, setRedirectPath] = useState(null)
  const [gameAction, setGameAction] = useState("none")
  const [allGames, setAllGames] = useState([])
  const [gameUrl, setGameUrl] = useState("")
  const [gameName, setGameName] = useState({
    name: ""
  })
  const [redirect, setRedirect] = useState(false)
  const [errors, setErrors] = useState([])
  const nameTerm = "name"
  const nameTerms = "names"
  const nameDescription = "names of people or fictional characters"

  useEffect(() => {
    fetch(`/api/v1/games`)
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
    .then(games => {
      setAllGames(games)
    })
  }, [])

  const convertNameToPath = (name) => {
    return name.replace(/[^0-9a-zA-Z ]/g, '').replace(/ /g, "-").toLowerCase()
  }

  const handleInputChange = (event) => {
    if (errors !== []) {
      setErrors([])
    }
    setGameName({"name": event.currentTarget.value})
  }

  const validForSubmission = () => {
    if (gameName.name === "") {
      return setErrors(["Game Name cannot be blank."])
    }
    const url = convertNameToPath(gameName.name)
    return !allGames.find(game => game.url === url)
  }

  const createGame = (event) => {
    event.preventDefault()
    if (validForSubmission()) {
      fetch('/api/v1/games/', {
        credentials: "same-origin",
        method: 'POST',
        body: JSON.stringify(gameName),
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
          setGameUrl(body.url)
          setRedirect(true)
        } else {
          setErrors(body.errors)
          setEntryFields(body.fields)
        }
      })
      .catch(error => console.error(`Error in fetch: ${error.message}`))

      setGameName({name: ""})
    } else {
      setErrors(["Game Name already taken. Please choose something else."])
    }
  }

  if (redirect) {
    window.location.href = `/game/${gameUrl}/form`
  }

  const joinGame = (event) => {
    event.preventDefault()
    if (gameName.name === "") {
      return setErrors(["Game Name cannot be blank."])
    }
    const joinUrl = convertNameToPath(gameName.name)
    fetch(`/api/v1/games/${joinUrl}`)
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
    .then(game => {
      if (game.id) {
        setGameUrl(game.url)
        if (game.round === 4) {
          fetch(`/api/v1/games/${game.url}/notifications/reset`)
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
            setRedirectPath("form")
          })
          .catch(error => console.error(`Error in fetch: ${error.message}`))
        }
        if (game.round >= 1 && game.round <= 3) {
          alert(`${game.name} is already in progress. Here's the scoreboard!`)
          setRedirectPath("scoreboard")
        }
        if (game.round === 0) {
          setRedirectPath("form")
        }
      } else {
        setErrors(game.errors)
      }

    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }

  if (redirectPath) {
    window.location.href = `/game/${gameUrl}/${redirectPath}`
  }

  return (
    <span>
      <div id="background" className="background">
      </div>
      <header>
        <a href="/privacypolicy" target="_blank">Privacy Policy</a>
      </header>
      <div className="home-screen">
        <h1>Salad Bowl!</h1>

        <div className="rules-list">
          <p className="rule">Before the game begins, players form two equal teams: Red and Blue. Then, each player submits 5 {nameDescription}. Teams will compete in 3 rounds. &nbsp;</p>
          <p className="rule">Round 1: When the first player clicks "My Turn," they will see one {nameTerm} at a time. They will need to use words (no hand gestures) to get their teammates to guess the {nameTerm}, without saying the {nameTerm} itself. Teams will alternate until all {nameTerms} have been guessed.</p>
          <p className="rule">Round 2: This round is similar, except the player giving clues can only say one word for each {nameTerm}. They can repeat the word as many times as desired.</p>
          <p className="rule">Round 3: Charades! (no talking allowed)</p>
        </div>

        {gameAction === "none" && (
          <span>
            <button onClick={() => setGameAction("join")} type="button" className="submit-button home-button">Join Game</button>
            <button onClick={() => setGameAction("create")} type="button" className="submit-button home-button">Create New Game</button>
          </span>
        )}
        <ErrorList
          errors={errors}
          />
        {gameAction === "join" && (
          <form onSubmit={joinGame} className="entry-form">
            <label>Enter your game name:
              <input
                type="text"
                value={gameName.name}
                onChange={handleInputChange}
                className="game-input"
                />
            </label>
            <input type="submit" className="submit-button home-button" value="Join Game" />
            <button
              onClick={() => {
                setGameAction("none")
                if (errors !== []) {
                  setErrors([])
                }
              }}
              className="cancel-button"
              type="button">
              Cancel
            </button>
          </form>
        )}
        {gameAction === "create" && (
          <form onSubmit={createGame} className="entry-form">
            <label>Create a name for your game:
              <input
                type="text"
                maxLength="50"
                value={gameName.name}
                onChange={handleInputChange}
                className="game-input"
                />
            </label>
            <input type="submit" className="submit-button home-button" value="Create New Game" />
            <button
              onClick={() => {
                setGameAction("none")
                if (errors !== []) {
                  setErrors([])
                }
              }}
              className="cancel-button"
              type="button">
              Cancel
            </button>
          </form>
        )}
      </div>
    </span>
  )
}

export default Home
