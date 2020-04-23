import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import _ from "lodash"
import ErrorList from "./ErrorList"

export const Form = (props) => {
  const [errors, setErrors] = useState({})
  const [redirect, setRedirect] = useState(false)
  const [entryFields, setEntryFields] = useState({
    entryOne: '',
    entryTwo: '',
    entryThree: '',
    entryFour: '',
    entryFive: ''
  })

  const handleInputChange = event => {
    setEntryFields({
      ...entryFields,
      [event.currentTarget.id]: event.currentTarget.value
    })
  }

  const validForSubmission = () => {
    let submitErrors = {}

    const requiredFields = ["entryOne", "entryTwo", "entryThree", "entryFour", "entryFive"]

    requiredFields.forEach(field => {
      if(entryFields[field].trim() === "") {
        submitErrors = {
          "You": "must submit 5 names to play salad bowl 🥗"
        }
      }
    })

    setErrors(submitErrors)
    return _.isEmpty(submitErrors)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validForSubmission()) {
      fetch('/api/v1/entries/', {
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
          setRedirect(true)
        } else {
          setErrors(body.errors)
          setEntryFields(body.fields)
        }
      })
      .catch(error => console.error(`Error in fetch: ${error.message}`))

      setEntryFields({
        entryOne: '',
        entryTwo: '',
        entryThree: '',
        entryFour: '',
        entryFive: ''
      })
    }
  }

  if (redirect) {
    return <Redirect to="/scoreboard" />
  }

  return (
    <span className="form-page">
      <form onSubmit={handleSubmit} className="entry-form">
        <h4>Welcome to Salad Bowl! Before we play, we need you to submit 5 names!</h4>
        <ErrorList
          errors={errors}
          />
        <label htmlFor="entryOne">Name #1:
          <input
            className="entry"
            type="text"
            id="entryOne"
            value={entryFields.entryOne}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryTwo">Name #2:
          <input
            className="entry"
            type="text"
            id="entryTwo"
            value={entryFields.entryTwo}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryThree">Name #3:
          <input
            className="entry"
            type="text"
            id="entryThree"
            value={entryFields.entryThree}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryFour">Name #4:
          <input
            className="entry"
            type="text"
            id="entryFour"
            value={entryFields.entryFour}
            onChange={handleInputChange}
            />
        </label>
        <label htmlFor="entryFive">Name #5:
          <input
            className="entry"
            type="text"
            id="entryFive"
            value={entryFields.entryFive}
            onChange={handleInputChange}
            />
        </label>
        <input className="submit-button" id="submit" type="submit" value="Submit" />
      </form>
    </span>
  )
}

export default Form
