import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

import React from "react"

import Home from './Home'
import { Admin } from './Admin'

const Routes = () => (
  <Router>
    <Switch>
      <Route path="/admin" component={Admin} />
      <Route path="/:hex?" component={Home} />
    </Switch>
  </Router>
)

export default Routes