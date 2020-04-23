import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Form from './Form'
import Home from './Home'
import Scoreboard from './Scoreboard'
import MyTurn from './MyTurn'

export const App = (props) => {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/form" component={Form} />
          <Route exact path="/scoreboard" component={Scoreboard} />
          <Route exact path="/myturn" component={MyTurn} />
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default App
