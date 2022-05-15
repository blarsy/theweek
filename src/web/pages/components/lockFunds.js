import { useState, useEffect } from 'react'
import { Button, Typography, CircularProgress, Stack } from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import { formatEther } from 'ethers/lib/utils'
import { getAmountToLock } from '../../lib/lockerContractFacade'
import { useAppContext } from '../../lib/appState'

export default function LockFunds({ onLocking }) {
    const [amountToLock, setAmountToLock] = useState(0)
    const [isLocking, setIsLocking] = useState(false)
    const [state] = useAppContext()

    useEffect(async () => {
        if(amountToLock === 0) {
            const amountFromContract = await getAmountToLock(state.signer)
            setAmountToLock(formatEther(amountFromContract))
        }
    })

    if(amountToLock === 0) return <CircularProgress />

    return <Stack direction="column" alignItems="center" spacing={2}>
        <Typography variant="subtitle1">You are required to lock {amountToLock} MATIC&apos;s when joining.</Typography>
        <Typography variant="subtitle1">It will refunded 100% if</Typography>
        <Typography variant="subtitle2">
        { ['none of the dates you picked are confirmed', 
        'the watch party is confirmed, and you show up to all episodes', 
        'the watch party is confirmed, but then cancelled from our side (exceptionnal)']
        .map((text, idx) => <Stack key={idx} direction="row"><CheckCircleOutline color="success"/>{text}</Stack>)}
        </Typography>
        <Typography variant="subtitle1">Otherwise, we keep your MATIC&apos;s in our DAO, sorry.</Typography>
        <Button variant="contained" onClick={async () => {
            setIsLocking(true)
            try {
                await onLocking()
            } finally {
                setIsLocking(false)
            }
        }}>Lock funds</Button>{ isLocking && <CircularProgress/> }
    </Stack>
}