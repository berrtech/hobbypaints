import React from "react";
import SearchForm from './components/SearchForm'
import PaintSlot from './components/PaintSlot'
import get from 'lodash/get'
import { isValidHexColor } from './utils'
import { getClosestPaints } from '../../api'

class Home extends React.Component {
  state = {
    paints: [],
    loading: false,
    brandsCount: 0
  }

  componentDidMount() {
    this.fetchPaints()
    this.fetchBrandsCount()
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.hex !== prevProps.match.params.hex) {
      this.fetchPaints()
    }
  }

  fetchBrandsCount = () => {
    fetch('/api/brands/count')
      .then(res => res.json())
      .then(res => {
        this.setState({
          brandsCount: res.count
        })
      })
  }

  fetchPaints = () => {
    const { hex } = this.props.match.params
    if (!hex || !isValidHexColor(hex)) return
    this.setState({ loading: true })

    getClosestPaints(hex)
      .then(res => {
        this.setState({
          paints: res,
          loading: false
        })
      })
  }

  render() {
    const { paints, loading, brandsCount } = this.state
    const { hex } = this.props.match.params

    const slots = new Array(brandsCount).fill(null)

    return (
      <React.Fragment>
        <SearchForm loading={loading} />
        <div className='container'>
          <div className='row'>
            {slots.map((v, index) => {
              const paint = paints[index]
              return (
                <PaintSlot
                  key={index}
                  totalSlotsCount={slots.length}
                  paint={get(paint, 'paint')}
                  deltaE={get(paint, 'deltaE')}
                  baseColor={hex}
                />
              )
            })}


          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default Home
