import React from 'react'
import styles from './Paint.module.css'
import { Link } from 'react-router-dom'
import hex2rgb from 'hex2rgb'

const getTextColor = backgroundColor => {
  const rgb = hex2rgb(backgroundColor).rgb

  if (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 186) {
    return '#000000'
  }

  return '#ffffff'
}

const getDeltaPerception = (deltaE) => {
  switch (true) {
    case (deltaE === 0): {
      return {
        title: 'Same color',
        color: '#19541f'
      }
    }
    case (deltaE <= 1): {
      return {
        title: 'Not perceptible by human eyes.',
        color: '#2a8735'
      }
    }
    case (deltaE <= 2): {
      return {
        title: 'Perceptible through close observation.',
        color: '#55a557'
      }
    }
    case (deltaE <= 10): {
      return {
        title: 'Perceptible at a glance.',
        color: '#ea7d24'
      }
    }
    case (deltaE <= 49): {
      return {
        title: 'More similar than opposite',
        color: '#ea4444'
      }
    }
    default: {
      return {
        title: 'Exact opposite',
        color: '#b60c26'
      }
    }
  }
}

const Paint = ({ paint, deltaE, baseColor }) => {
  const perception = getDeltaPerception(deltaE)

  return (
    <div className={`${styles['paint-wrapper']}`}>
      <div
        className={`${styles.paint}`}
        style={{ borderColor: perception.color }}
      >
        <div
          className={styles['base-color']}
          style={{
            backgroundColor: `#${baseColor}`
          }}
          title={`Base color: #${baseColor.toUpperCase()}`}
        >
          <div
            className={styles.color}
            style={{ backgroundColor: `#${paint.hex}` }}
            title={`${paint.brand} - ${paint.name}: #${paint.hex.toUpperCase()}`}
          />
        </div>

        <p className={styles['paint-details']}>
          <strong>{paint.brand}</strong>
          <br />
          {paint.name}
          <br />
          <Link to={`/${paint.hex}`}>#{paint.hex.toUpperCase()}</Link>
        </p>

        <p
          className={styles['deltaE-wrapper']}
          style={{
            borderColor: perception.color,
            backgroundColor: perception.color,
            color: getTextColor(perception.color)
          }}
        >
          &Delta;E = {deltaE}
          <br />
          <span className={styles['perception-title']}>{perception.title}</span>
        </p>

      </div>
    </div>
  )
}


export default Paint