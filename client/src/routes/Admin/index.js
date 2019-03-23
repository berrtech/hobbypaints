import React from 'react'
import { Router, Switch, Route } from 'react-router-dom'
import { Login } from './components/Login'
import { Paints } from './components/Paints'
import { Paint } from './components/Paint'

import { getIsAuthenticated } from '../../api'

export class Admin extends React.Component {
  state = {
    loading: true,
    isAuthenticated: false
  }

  componentDidMount = async () => {
    const credentials = JSON.parse(localStorage.getItem('credentials'))

    if (credentials) {
      const authenticated = await getIsAuthenticated(credentials)
      this.handleAuth(authenticated)
    }

    this.setState({ loading: false })
  }

  handleAuth = isAuthenticated => {
    this.setState({
      isAuthenticated
    })
  }

  render() {
    const { isAuthenticated, loading } = this.state;
    const { handleAuth } = this;

    if (loading) return 'Loading...'

    if (!isAuthenticated) {
      return (
        <Login onAuth={handleAuth} />
      )
    }

    return (
      <Switch>
        <Route path="/admin" exact component={Paints} />
        <Route path="/admin/:id" exact component={Paint} />
      </Switch>
    )

  }
}
