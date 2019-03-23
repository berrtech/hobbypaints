import React from 'react'
import styles from './Login.module.css'

import { getIsAuthenticated } from '../../../../api'

const LoginComponent = ({ login, password, onSubmit, onChange }) => (
  <form className={styles['login-form']} onSubmit={onSubmit}>

    <div className='form-group'>
      <label>Login</label>
      <input className="form-control" type='text' value={login} onChange={e => onChange('login', e.target.value)} />
    </div>

    <div className='form-group'>
      <label>Password</label>
      <input className='form-control' type="password" value={password} onChange={e => onChange('password', e.target.value)} />
    </div>

    <div className='form-group'>
      <button type='submit' className='btn btn-primary'>Submit</button>
    </div>

  </form>
)

export class Login extends React.Component {
  state = {
    login: '',
    password: ''
  }

  handleChange = (prop, value) => this.setState({ [prop]: value })

  handleSubmit = async (e) => {
    e.preventDefault();

    const isAuthenticated = await getIsAuthenticated(this.state)

    if (isAuthenticated) {
      localStorage.setItem('credentials', JSON.stringify(this.state))
    }

    this.props.onAuth(isAuthenticated)
  }

  render() {
    const { login, password } = this.state;
    const { handleChange, handleSubmit } = this;

    return <LoginComponent login={login} password={password} onChange={handleChange} onSubmit={handleSubmit} />
  }
}