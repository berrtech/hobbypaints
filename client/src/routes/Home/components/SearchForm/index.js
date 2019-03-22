import React from 'react'
import styles from './SearchForm.module.css'
import { withRouter } from "react-router-dom"
import Select from 'react-select'
import { isValidHexColor } from '../../utils'
import { searchPaint } from '../../../../api'
import throttle from 'lodash/throttle'

class SearchForm extends React.Component {
  constructor(props) {
    super(props)

    const { hex } = props.match.params

    this.state = {
      value: hex || '',
      searchResults: []
    }
    this.throttledSearchPaint = throttle(this.searchPaint, 500, { leading: true, trailing: true })
  }

  componentDidUpdate(prevProps, prevState) {
    const { hex } = this.props.match.params

    if (hex !== prevProps.match.params.hex) {
      this.setState({ value: hex || '' })
    }
  }

  searchPaint = async (value) => {
    const paints = await searchPaint(value)
    this.setState({
      searchResults: paints.map(paint => ({ label: paint.name + ' - #' + paint.hex, value: paint._id, hex: paint.hex }))
    })
  }

  setValue = (value, { action }) => {

    if (action === "set-value" ||
      action === "input-blur" ||
      action === "menu-close") {
      return;
    }

    this.setState({ value })
    this.throttledSearchPaint(value)
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.history.push(`/${this.state.value}`)
  }

  handleSelect = paint => {
    this.props.history.push(`/${paint.hex}`)
  }

  render() {
    const { setValue, handleSubmit, handleSelect } = this
    const { value, searchResults } = this.state
    const { loading } = this.props

    console.log(value);


    return (
      <div className={styles['search-form__wrapper']}>
        <form className={`form-inline ${styles["search-form"]}`} onSubmit={handleSubmit}>
          <div className={`input-group ${styles['search-form__input-group']}`}>
            <Select
              onInputChange={setValue}
              blurInputOnSelect={false} //set by default, but to be sure
              closeMenuOnSelect={false} //prevents menu close after select, which would also result in input blur
              inputValue={value}
              value={null}
              onChange={handleSelect}
              options={searchResults}
              backspaceRemovesValue={false}
              isLoading={loading}
              className={styles['select']}
              placeholder='Hex color or paint name'
              styles={{
                dropdownIndicator: () => ({ display: 'none' }),
                indicatorSeparator: () => ({ display: 'none' })
              }}
            />
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