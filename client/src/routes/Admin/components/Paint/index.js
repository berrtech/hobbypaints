import React from 'react'
import styles from './Paint.module.css'

import { getPaintById, updatePaint, createPaint } from '../../../../api'
import { Link } from 'react-router-dom'

export class Paint extends React.Component {

  constructor(props) {
    super(props)

    const id = props.match.params.id

    this.state = {
      paint: {
        _id: '',
        name: '',
        hex: '',
        brand: '',
        type: ''
      },
      loading: id !== 'new',
      submitting: false
    }
  }

  componentDidMount = () => {
    const id = this.props.match.params.id

    if (id !== 'new') {
      this.fetchPaint(id)
    }
  }

  fetchPaint = async id => {
    const paint = await getPaintById(id)

    this.setState({
      paint,
      loading: false
    })
  }

  handleChange = (prop, value) => {
    const paint = { ...this.state.paint }

    paint[prop] = value

    this.setState({ paint })
  }

  handleSubmit = async e => {
    e.preventDefault();
    const id = this.props.match.params.id

    this.setState({ submitting: true })
    console.log(this.state.paint);

    id === 'new' && await createPaint(this.state.paint) || await updatePaint(this.state.paint)
    this.setState({ submitting: false })
  }

  render() {
    const { paint, loading, submitting } = this.state;
    const { handleChange, handleSubmit } = this;

    if (loading) return 'Loading...'

    return (
      <div className={styles['paint-form']}>
        <Link to='/admin' style={{ display: 'inline-block', marginBottom: 20 }}>Back to list</Link>

        <form onSubmit={handleSubmit}>

          <div className='form-group'>
            <b>{paint._id}</b>
          </div>

          {this.props.match.params.id === 'new' && (
            <div className='form-group'>
              <label>Id</label>
              <input type="text" className='form-control' value={paint._id} onChange={e => handleChange('_id', e.target.value)} disabled={submitting} />
            </div>
          )}

          <div className='form-group'>
            <label>Name</label>
            <input type="text" className='form-control' value={paint.name} onChange={e => handleChange('name', e.target.value)} disabled={submitting} />
          </div>

          <div className='form-group'>
            <label>Color</label>
            <div style={{ position: 'relative' }}>
              <span className={styles['color-block']} style={{ backgroundColor: '#' + paint.hex }} />
              <input type="text" className='form-control' value={paint.hex} onChange={e => handleChange('hex', e.target.value)} disabled={submitting} />
            </div>
          </div>

          <div className='form-group'>
            <label>Brand</label>
            <input type="text" className='form-control' value={paint.brand} onChange={e => handleChange('brand', e.target.value)} disabled={submitting} />
          </div>

          <div className='form-group'>
            <label>Type</label>
            <input type="text" className='form-control' value={paint.type} onChange={e => handleChange('type', e.target.value)} disabled={submitting} />
          </div>

          <div className='form-group'>
            <button type='submit' className='btn btn-primary' disabled={submitting}>Submit</button>
            {'  '}
            {submitting && 'Saving...'}
          </div>

        </form>
      </div>
    )
  }
}