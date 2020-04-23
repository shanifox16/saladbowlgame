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
    <div>
      <p>Welcome to Salad Bowl!</p>
      <p>Here are the rules!</p>
      <ol>
        <li>Rule 1</li>
        <li>Rule 2</li>
      </ol>

      <form onSubmit={letsPlay}>
        <input type="submit" class="submit-button" value="Let's Play!" />
      </form>
    </div>
  )
}

export default Home
