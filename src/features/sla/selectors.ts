import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export const selectSlaState = (state: RootState) => state.sla

export const selectSlaSettings = createSelector(
  [selectSlaState],
  (sla) => sla.settings
)

export const selectAlerts = createSelector(
  [selectSlaState],
  (sla) => sla.alerts
)

export const selectRedAlerts = createSelector(
  [selectAlerts],
  (alerts) => alerts.filter(alert => alert.severity === 'red')
)

export const selectYellowAlerts = createSelector(
  [selectAlerts],
  (alerts) => alerts.filter(alert => alert.severity === 'yellow')
)

export const selectUnackedCount = createSelector(
  [selectAlerts],
  (alerts) => alerts.filter(alert => !alert.acknowledgedBy).length
)
