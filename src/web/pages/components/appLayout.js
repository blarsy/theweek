import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { BottomNavigation, BottomNavigationAction, AppBar, 
    Toolbar, IconButton, Typography, Menu, MenuItem, Box } from '@mui/material'
import GroupsIcon from '@mui/icons-material/Groups'
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation'
import MenuIcon from '@mui/icons-material/Menu'
import { useAppContext } from '../../lib/appState'
import Organize from './organize'
import Invitations from './invitations'

export default function AppLayout() {
    const theme = useTheme()
    const largeScreen = useMediaQuery(theme.breakpoints.up('md'))
    const [menuAnchorEl, setMenuAnchorEl] = useState(null)
    const [state] = useAppContext()

    const viewTitles = ['Organise watch parties', 'Invitations']
    const menuItemSelected = view => {
      state.mergeWithState(state, { currentView: view })
      setMenuAnchorEl(null)
    }

    let component

    switch(state.currentView) {
        case 0:
            component = <Organize/>
            break
        case 1:
            component = <Invitations/>
            break
        default:
    }

    return (<Box sx={{ display: 'flex', flexGrow: 1, flexFlow: 'column nowrap' }}>
        <AppBar position="static">
            <Toolbar>
                {largeScreen && <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={e => setMenuAnchorEl(e.currentTarget)}
                sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>}
                <Menu
                open={!!menuAnchorEl}
                anchorEl={menuAnchorEl}
                onClose={() => setMenuAnchorEl(null)}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                >
                    <MenuItem onClick={() => menuItemSelected(0)}>Organize</MenuItem>
                    <MenuItem onClick={() => menuItemSelected(1)}>Invites</MenuItem>
                </Menu>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {viewTitles[state.currentView]}
                </Typography>
            </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', flexGrow: 1, flexFlow: 'column nowrap', paddingBottom: largeScreen ? '0' : '3rem' }}>
            {component}
        </Box>
        {!largeScreen && <BottomNavigation
            sx={{ position: 'fixed', bottom: 0, width: '100%', left: 0 }}
            showLabels
            value={state.currentView}
            onChange={(event, newValue) => {
                state.mergeWithState(state, { currentView: newValue })
            }}>
        <BottomNavigationAction label="Organize" icon={<GroupsIcon />} />
        <BottomNavigationAction label="Invites" icon={<InsertInvitationIcon />} />
        </BottomNavigation>}
    </Box>)
}
