import { useAppContext } from '../lib/appState'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Presentation from './components/presentation'
import FacilitatorDashboard from './components/facilitatorDashboard'
import AppLayout from './components/appLayout'

export default function Home() {
  const [state] = useAppContext()
  const theme = useTheme()
  const largeScreen = useMediaQuery(theme.breakpoints.up('md'))

  if(state.walletAddress){
    if(state.isFacilitator) {
      return (<Box sx={{ display: 'flex', flexGrow: 1, flexFlow: 'column nowrap', paddingBottom: largeScreen ? '0' : '3rem' }}>
        <FacilitatorDashboard />
      </Box>)
    } else {
      return <AppLayout />
    }
  } else {
    return <Presentation />
  }
}
