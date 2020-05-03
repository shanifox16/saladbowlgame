import React from "react"
import _ from "lodash"

const ErrorList = props => {
  if (props.errors.length > 0) {
    let index = 0
    const listItems = props.errors.map(error => {
      return (
        <li key={error}>
          {error}
        </li>
      )
    })

    return (
      <div className="error-list">
        <ul>{listItems}</ul>
      </div>
    )
  } else {
    return ""
  }
}

export default ErrorList
