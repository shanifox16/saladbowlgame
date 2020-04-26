import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom'

export const Home = (props) => {
  const [redirectPath, setRedirectPath] = useState(null)

  const letsPlay = (event) => {
    event.preventDefault()
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
      // If round is 4, clear all entries, set round to 0, and redirect to form
      if (round === 4) {
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
          setRedirectPath("form")
        })
        .catch(error => console.error(`Error in fetch: ${error.message}`))
      }
      if (round >= 1 && round <= 3) {
        alert("Game is already in progress. Here's the scoreboard!")
        setRedirectPath("scoreboard")
      }
      if (round === 0) {
        setRedirectPath("form")
      }

    })
    .catch(error => console.error(`Error in fetch: ${error.message}`))
  }

  if (redirectPath) {
    return <Redirect to={`/${redirectPath}`} />
  }

  return (
    <div className="home-screen">
      <p>Welcome to Salad Bowl!</p>
      <div className="rules-list">
        <p style={{textAlign: "center"}}>How to play:</p>
        <p>First, each player will submit 5 names of people or fictional characters. Then, players will separate into two equal teams to compete in three rounds.&nbsp;</p>
        <p>Round 1: When the first player clicks "My Turn," they will see one name at a time. They will need to use words (no hand gestures) to get their teammates to guess the name, without saying the name itself. Teams will alternate until all names have been guessed.</p>
        <p>Round 2: This round is similar, except the player giving clues can only say one word for each name. They can repeat the word as many times as desired.</p>
        <p>Round 3: Charades! (no talking allowed)</p>
      </div>

      <form onSubmit={letsPlay}>
        <input type="submit" class="submit-button" value="Let's Play!" />
      </form>
    </div>
  )
}

export default Home
