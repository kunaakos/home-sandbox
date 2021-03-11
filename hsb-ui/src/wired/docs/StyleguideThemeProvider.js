// src/Provider.js
import React from 'react'
import { ThemeProvider } from '@emotion/react'

import { wiredDarkTheme } from '../../themes/wired-dark'

// NOTE: default export used because of 3rd party api requirements
export default function Provider({ children }) {
  return <ThemeProvider theme={wiredDarkTheme}>{children}</ThemeProvider>
}
