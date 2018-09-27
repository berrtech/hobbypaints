import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import React from "react"

import Home from './Home'

const Routes = () => (
  <Router>
    <Route path="/:hex?" component={Home} />
  </Router>
)

export default Routes