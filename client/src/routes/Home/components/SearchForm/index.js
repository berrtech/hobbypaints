import React from 'react'
import cn from 'classnames'
import styles from './SearchForm.module.css'
import { withRouter } from "react-router-dom"
import { isValidHexColor } from '../../utils'

class SearchForm extends React.Component {
  constructor(props) {
    super(props)

    const { hex } = props.match.params

    this.state = {
      value: hex || '',
      isValid: hex ? isValidHexColor(hex) : true
    }
  }

  componentDidUpdate(prevProps) {
    const { hex } = this.props.match.params

    if (hex !== prevProps.match.params.hex) {
      this.setState({ value: hex || '', isValid: true })
    }
  }

  setValue = e => {
    e.persist()

    this.setState(({ isValid }) => {
      let isInputValid = isValidHexColor(e.target.value)
      if (e.target.value.length && !isValid && isInputValid) {
        isInputValid = true
      } else if (!e.target.value.length) {
        isInputValid = true
      } else {
        isInputValid = isValid
      }

      return {
        value: e.target.value,
        isValid: isInputValid
      }
    })
  }

  validate = (callback) => {
    this.setState(({ value }) => ({
      isValid: !value.length || isValidHexColor(value)
    }), callback)
  }

  handleSubmit = e => {
    e.preventDefault();
    this.validate(() => {
      if (this.state.isValid) {
        this.props.history.push(`/${this.state.value}`)
      }
    })
  }

  render() {
    const { setValue, validate, handleSubmit } = this
    const { isValid, value } = this.state
    const { loading } = this.props

    return (
      <div className={styles['search-form__wrapper']}>
        <form className={`form-inline ${styles["search-form"]}`} onSubmit={handleSubmit}>
          <div className={`input-group ${styles['search-form__input-group']}`}>
            <input
              type="text"
              className={cn(`form-control`, { 'is-invalid': !isValid })}
              placeholder='Hex Color'
              onBlur={() => validate()}
              value={value}
              onChange={setValue}
            />
            {loading && <div className={styles.spinner} />}
            <div className="input-group-append">
              <button type='submit' className='btn btn-primary mb-2'>Search</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

export default withRouter(SearchForm)