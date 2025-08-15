import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Event } from '../../lib/types'
import { evaluateAlerts } from './engine'
import { setAlerts } from './slaSlice'
import { selectSlaSettings } from './selectors'
import { selectDataset } from '../imports/selectors'

export function useSlaEngine() {
  const dispatch = useDispatch()
  const settings = useSelector(selectSlaSettings)
  const events = useSelector(selectDataset('events')) as Event[]
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Initial evaluation
    const alerts = evaluateAlerts(events, settings)
    dispatch(setAlerts(alerts))

    // Set up periodic evaluation every 60 seconds
    intervalRef.current = setInterval(() => {
      const newAlerts = evaluateAlerts(events, settings)
      dispatch(setAlerts(newAlerts))
    }, 60000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [dispatch, events, settings])
}
