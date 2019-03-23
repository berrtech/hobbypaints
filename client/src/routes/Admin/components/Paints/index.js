import React from 'react'
import { Link } from 'react-router-dom'
import { getPaints, deletePaint } from '../../../../api'
import styles from './Paints.module.css'

const PaintsComponent = ({ paints, onDelete }) => (
  <div className={styles['wrapper']}>
    <Link to='/admin/new' className={styles['create-link']}>Create paint</Link>
    <table className="table table-sm table-hover">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col" style={{ width: '10%' }}>Id</th>
          <th scope="col">Name</th>
          <th scope="col" style={{ textAlign: 'left' }}>Color</th>
          <th scope="col">Brand</th>
          <th scope="col">Type</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {paints.map((paint, index) => (
          <tr key={paint._id}>
            <td scope="row">{index}</td>
            <td>{paint._id}</td>
            <td><Link to={'/admin/' + paint._id}>{paint.name}</Link></td>
            <td style={{ textAlign: 'left' }}>
              <span className={styles['color']}>
                <span className={styles['colored-block']} style={{ backgroundColor: '#' + paint.hex }} />
                {' '}
                #{paint.hex}
              </span>
            </td>
            <td>{paint.brand}</td>
            <td>{paint.type}</td>
            <td><button type='button' className='btn btn-danger' onClick={() => onDelete(paint)}>Delete</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export class Paints extends React.Component {
  state = {
    paints: [],
    loading: true
  }

  componentDidMount = () => {
    this.fetchPaints()
  }

  fetchPaints = async () => {
    const paints = await getPaints()

    this.setState({ paints, loading: false })
  }

  handleDelete = async ({ brand, name, _id }) => {
    if (window.confirm('Deleting ' + brand + ' ' + name + ', are you sure?')) {
      await deletePaint(_id)
      this.setState({ paints: [], loading: true })
      this.fetchPaints()
    }
  }

  render() {
    const { paints, loading } = this.state;
    const { handleDelete } = this

    if (loading) {
      return 'Loading...'
    }

    return <PaintsComponent paints={paints} onDelete={handleDelete} />
  }
}