import React from 'react'
import styles from './PaintSlot.module.css'
import Paint from '../Paint'

import {
  CSSTransition,
  TransitionGroup,
} from 'react-transition-group';

import { isValidHexColor } from '../../utils'

const PaintSlot = ({ paint, deltaE, baseColor, totalSlotsCount }) => (
  <div
    className={`col-lg-${12 / totalSlotsCount} col-md-6 ${styles['paint-slot']}`}
  >
    <TransitionGroup
      timeout={950}
    >
      {paint && baseColor && isValidHexColor(baseColor) && (
        <CSSTransition
          key={paint._id}
          classNames={{
            enter: "animated",
            enterActive: `zoomIn`,
            exit: "animated",
            exitActive: `zoomOut`
          }}
          timeout={950}
        >
          <Paint
            key={paint._id}
            paint={paint}
            deltaE={deltaE}
            baseColor={baseColor}
          />
        </CSSTransition>
      )}
    </TransitionGroup>
  </div>
)

export default PaintSlot