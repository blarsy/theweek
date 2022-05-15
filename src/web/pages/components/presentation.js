import { Stack, Typography, Button, Box, Link } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import HandshakeOutlined from '@mui/icons-material/HandshakeOutlined'
import { useAppContext } from '../../lib/appState'

const theme = createTheme({
  typography: {
    htmlFontSize: 10,
    h1: {
      fontSize: '3rem'
    },
    h2: {
      fontSize: '2.5rem'
    },
  },
})

export default function Presentation() {
    const [state, setState] = useAppContext()

    return <ThemeProvider theme={theme}>
    <Stack alignItems="stretch" spacing={1}>
      <Box sx={{ padding: '2rem 0 2rem', backgroundColor: 'primary.dark', color: '#DDD', flexGrow: '1', display: 'flex', alignItems: 'stretch' }}>
        <Stack alignItems="center" sx={{flexGrow: '1'}}>
          <Typography variant="h1">DAOs</Typography>
          <HandshakeOutlined fontSize="large"/>
          <Typography variant="h1">Environment</Typography>
        </Stack>
      </Box>
      <Typography variant="h2" align="center">Begin the journey with your fellow DAOists</Typography>
      <Box sx={{ flexGrow: '1', display:'flex', alignItems:'center', flexDirection:'column'}}>
        <Button onClick={state.tryConnect} variant="contained" sx={{ padding: '1rem', margin:'1rem 0'}}>Connect</Button>
      </Box>
      <Typography variant="h2" align="center">go through <nobr><Link target="_blank" href="https://theweek-prototype.weebly.com/">&quot;The Week&quot;</Link>&apos;s</nobr> process</Typography>
    </Stack>
  </ThemeProvider>
}