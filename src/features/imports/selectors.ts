import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { FileType } from '../../lib/types'

export const selectImportsState = (state: RootState) => state.imports

export const selectMappings = createSelector(
  [selectImportsState],
  (imports) => imports.mappings
)

export const selectMappingsByType = (fileType: FileType) =>
  createSelector(
    [selectMappings],
    (mappings) => mappings[fileType] || {}
  )

export const selectDataset = (fileType: FileType) =>
  createSelector(
    [selectImportsState],
    (imports) => imports.datasets[fileType]
  )

// Thin wrapper selectors for calculator
export const selectOrders = createSelector(
  [selectImportsState],
  (imports) => imports.datasets.indiaListings || []
)

export const selectProducts = createSelector(
  [selectImportsState],
  (imports) => imports.datasets.keepa || []
)

export const selectUspos = createSelector(
  [selectImportsState],
  (imports) => imports.datasets.uspo || []
)

export const selectSettlements = createSelector(
  [selectImportsState],
  (imports) => imports.datasets.settlement || []
)

export const selectAsinIndex = createSelector(
  [selectImportsState],
  (imports) => {
    const index: Record<string, string[]> = {}
    
    // Index ASINs from all datasets
    Object.entries(imports.datasets).forEach(([source, data]) => {
      data.forEach((item: any) => {
        if (item.asin) {
          if (!index[item.asin]) {
            index[item.asin] = []
          }
          const asinSources = index[item.asin]
          if (asinSources && !asinSources.includes(source)) {
            asinSources.push(source)
          }
        }
      })
    })
    
    return index
  }
)
