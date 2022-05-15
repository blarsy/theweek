import { useState, useEffect } from 'react'
import { Box, TableContainer, Table, TableBody, TableCell, TableHead, 
    TableRow, Button, Dialog, CircularProgress } from '@mui/material'
import { getCohorts } from '../../lib/apiFacade'
import CohortEdit from './cohortEdit'
import { useAppContext } from '../../lib/appState'

export default function FacilitatorDashboard() {
    const [cohorts, setCohorts] = useState(null)
    const [newCohortDialogOpen, setNewCohortDialogOpen] = useState(false)
    const [dateFormatter, setDateFormatter] = useState(Intl.DateTimeFormat(['en-US'],  { dateStyle: 'medium', timeStyle: 'short'}))
    const [state] = useAppContext()

    useEffect(async () => {
        setDateFormatter(Intl.DateTimeFormat(window.navigator.languages,  { dateStyle: 'medium', timeStyle: 'short'}))

        if(!cohorts) {
            setCohorts(await getCohorts(state.walletAddress))
        }
    })

    return (<Box>
        <h1>Facilitator</h1>
        {cohorts === null && <CircularProgress />}
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Episode 1</TableCell>
                        <TableCell>Episode 2</TableCell>
                        <TableCell>Episode 3</TableCell>
                        <TableCell>Confirmation deadline</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cohorts && cohorts.map((cohort, idx) => (
                        <TableRow key={idx}>
                            <TableCell>{idx}</TableCell>
                            <TableCell>{dateFormatter.format(new Date(cohort.datetimeEp1))}</TableCell>
                            <TableCell>{dateFormatter.format(new Date(cohort.datetimeEp2))}</TableCell>
                            <TableCell>{dateFormatter.format(new Date(cohort.datetimeEp3))}</TableCell>
                            <TableCell>{dateFormatter.format(new Date(cohort.confirmationDeadline))}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <Button onClick={() => setNewCohortDialogOpen(true)}>Add new cohort</Button>
        <Dialog
            fullScreen
            open={newCohortDialogOpen}
            onClose={() => setNewCohortDialogOpen(false)}>
            <CohortEdit onClose={() => setNewCohortDialogOpen(false)} onCohortCreated={ newCohort => {
                const updatedCohorts = cohorts
                updatedCohorts.push(newCohort)
                setCohorts(updatedCohorts)
                setNewCohortDialogOpen(false)
            }}/>
        </Dialog>
    </Box>)
}