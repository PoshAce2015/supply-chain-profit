import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { FileType } from '../../lib/types'
import { setMapping, ingest } from './importsSlice'
import { selectMappings } from './selectors'

export const useMappings = () => {
  const dispatch = useDispatch()
  const mappings = useSelector(selectMappings)

  const setMappingForType = useCallback(
    (fileType: FileType, mapping: Record<string, string>) => {
      dispatch(setMapping({ fileType, mapping }))
    },
    [dispatch]
  )

  return {
    mappings,
    setMapping: setMappingForType,
  }
}

export const useIngest = () => {
  const dispatch = useDispatch()

  const ingestFile = useCallback(
    (fileType: FileType, text: string) => {
      dispatch(ingest({ fileType, text }))
    },
    [dispatch]
  )

  return {
    ingest: ingestFile,
  }
}
