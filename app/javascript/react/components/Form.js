import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom'
import _ from "lodash"
import ErrorList from "./ErrorList"

export const Form = (props) => {
  const [errors, setErrors] = useState([])
  const [redirect, setRedirect] = useState(false)
  const [gameUrl, setGameUrl] = useState("")
  const [entryFields, setEntryFields] = useState({
    username: '',
    team: '',
    entryOne: '',
    entryTwo: '',
    entryThree: '',
    entryFour: '',
    entryFive: ''
  })

  const nameTerm = "name"
  const nameTerms = "names"
  const nameDescription = "names of people or fictional characters"

  const handleInputChange = event => {
    setEntryFields({
      ...entryFields,
      [event.currentTarget.id]: event.currentTarget.value
    })
  }

  const validForSubmission = () => {
    let submitErrors = []

    const requiredFields = ["entryOne", "entryTwo", "entryThree", "entryFour", "entryFive"]

    requiredFields.forEach(field => {
      if(entryFields[field].trim() === "") {
        submitErrors = ["You must submit 5 names to play salad bowl 🥗"]
      }
    })

    const requiredUserInfo = ["username", "team"]

    if(entryFields["team"].trim() === "") {
      submitErrors.unshift("Please select a team")
    }

    if(entryFields["username"].trim() === "") {
      submitErrors.unshift("Please enter your display name")
    }

    setErrors(submitErrors)
    return _.isEmpty(submitErrors)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const url = props.match.params.url
    if (validForSubmission()) {
      fetch(`/api/v1/games/${url}/entries/`, {
        credentials: "same-origin",
        method: 'POST',
        body: JSON.stringify(entryFields),
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
        if (!!body[0].id) {
          setGameUrl(url)
          setRedirect(true)
        } else {
          setErrors(body.errors)
          setEntryFields(body.fields)
        }
      })
      .catch(error => console.error(`Error in fetch: ${error.message}`))

      setEntryFields({
        username: '',
        team: '',
        entryOne: '',
        entryTwo: '',
        entryThree: '',
        entryFour: '',
        entryFive: ''
      })
    }
    window.scrollTo(0, 0)
  }

  if (redirect) {
    return <Redirect to={`/game/${gameUrl}/scoreboard`} />
  }

  return (
    <span className="form-page">
      <form onSubmit={handleSubmit} className="entry-form">
        <ErrorList
          errors={errors}
          />
        <label htmlFor="username">How would you like your name to display to other players?
          <input
            className="entry"
            type="text"
            id="username"
            maxlength="40"
            value={entryFields.username}
            onChange={handleInputChange}
            />
        </label>
        <select
          className="entry"
          id="team"
          name="team"
          value={entryFields.team}
          onChange={handleInputChange}
          >
          <option value="">What team are you on?</option>
          <option value="Red">Red</option>
          <option value="Blue">Blue</option>
        </select>

        <h5>Now, to prepare for your game, please submit 5 {nameDescription}.</h5>
        <h5>Players will need to guess these {nameTerms} later on, so they shouldn't be too obscure.</h5>
        <label htmlFor="entryOne">{_.capitalize(nameTerm)} #1:
          <input
            className="entry"
            type="text"
            id="entryOne"
            maxlength="40"
            value={entryFields.entryOne}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryTwo">{_.capitalize(nameTerm)} #2:
          <input
            className="entry"
            type="text"
            id="entryTwo"
            maxlength="40"
            value={entryFields.entryTwo}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryThree">{_.capitalize(nameTerm)} #3:
          <input
            className="entry"
            type="text"
            id="entryThree"
            maxlength="40"
            value={entryFields.entryThree}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryFour">{_.capitalize(nameTerm)} #4:
          <input
            className="entry"
            type="text"
            id="entryFour"
            maxlength="40"
            value={entryFields.entryFour}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryFive">{_.capitalize(nameTerm)} #5:
          <input
            className="entry"
            type="text"
            id="entryFive"
            maxlength="40"
            value={entryFields.entryFive}
            onChange={handleInputChange}
            />
        </label>
        <input className="submit-button" id="submit" type="submit" value="Submit" />
        <Link to="/">Wrong Game? Click here.</Link>
      </form>
    </span>
  )
}

export default Form
