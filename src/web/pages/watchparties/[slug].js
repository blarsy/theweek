import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Box, CircularProgress, Typography, Button, Stack, Stepper, Step, StepLabel, MobileStepper } from '@mui/material'
import { getWatchparty } from '../../lib/apiFacade'
import CohortSelector from '../components/cohortSelector'
import LockFunds from '../components/lockFunds'
import { useAppContext } from '../../lib/appState'
import { lockFunds } from '../../lib/lockerContractFacade'
import { createCandidateParticipant } from '../../lib/apiFacade'

export default function Watchparties() {
    const router = useRouter()
    const [state] = useAppContext()
    const { slug } = router.query
    const [watchparty, setWatchparty] = useState(null)
    const [multistep, setMultistep] = useState({ currentStep: 0, cohorts: [], numberOfSteps: 3})
    const theme = useTheme()
    const largeScreen = useMediaQuery(theme.breakpoints.up('md'))

    useEffect(async () => {
        if(!watchparty && slug) {
            setWatchparty(await getWatchparty(slug))
        }
    })

    let content

    const getBackButton = <Button variant="contained" onClick={() => goToPreviousStep()} disabled={multistep.currentStep === 0 || multistep.currentStep === multistep.numberOfSteps - 1}>Back</Button>
    const getNextButton = <Button variant="contained" onClick={() => goToNextStep()} disabled={multistep.currentStep === multistep.numberOfSteps - 1}>Next</Button>
    const getCurrentStepComponent = currentStep => {
        switch(currentStep) {
            case 0:
                return <CohortSelector value={multistep.cohorts} watchpartyCohorts={watchparty.organizer.cohorts} onChange={cohorts =>{
                    setMultistep({ ...multistep, ...{ cohorts }})
                }}></CohortSelector>
            case 1:
                return <LockFunds onLocking={async () => {
                    try {
                        const txLock = await lockFunds(state.signer, state.provider, watchparty.slug)
                        try {
                            await createCandidateParticipant({ 
                                address: state.walletAddress, 
                                cohorts: multistep.cohorts,
                                txLock,
                                watchpartySlug: watchparty.slug})
                            setMultistep({...multistep, ...{watchpartySlug: watchparty.slug, txLock, currentStep: 2 }})
                        } catch(e) {
                            state.setError(state, `An error occured when saving the participation info. Tell us about it, so that we can recover you your funds (Transaction hash: ${txLock}). Error message: ${e.message}`)
                        }
                    } catch(e) {
                        state.setError(state, `An error occured when trying to lock the MATIC's: ${e.message}`)
                    }
                }} />
            case 2:
                return <Stack>
                    <Typography variant="h5">Well done ! You just joined the watchparty.</Typography>
                </Stack>
            default:
        }
    }

    const goToNextStep = () => {
        if(multistep.currentStep < multistep.numberOfSteps - 1) {
            if(multistep.currentStep === 0 && multistep.cohorts.length === 0) {
                state.setError(state, 'Please select one or more cohort for which you are available.')
            } else if(multistep.currentStep === 1 && !multistep.txLock) {
                state.setError(state, 'Please lock funds to create the watch party.')
            } else {
                setMultistep({ ...multistep, ...{currentStep: multistep.currentStep + 1}})
            }
        }
    } 

    if(watchparty) {
        content = <Box>
            <Typography variant="subtitle1">{watchparty.participants} {watchparty.participants == 1 ? 'has': 'have'} answered already</Typography>
            <Stack sx={{ height: '100%', flexGrow: 1, padding: '0.5rem'}}>
                { largeScreen && [<Stepper key="stepper">
                    <Step completed={true}>
                        <StepLabel>Dates</StepLabel>
                    </Step>
                    <Step completed={multistep.currentStep > 0}>
                        <StepLabel>Lock funds</StepLabel>
                    </Step>
                    <Step completed={multistep.currentStep > 1}>
                        <StepLabel>Thank you</StepLabel>
                    </Step>
                </Stepper>,
                <Stack key="stepperButtons" direction='row' sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                    {getBackButton}
                    {getNextButton}
                </Stack>] }
                {!largeScreen && <MobileStepper
                    variant="dots"
                    steps={multistep.numberOfSteps}
                    activeStep={multistep.currentStep}
                    position="static"
                    sx={{ flexGrow: 0 }}
                    nextButton={getNextButton}
                    backButton={getBackButton}/>}
                <Box sx={{ flexGrow: 1 }}>
                    {getCurrentStepComponent(multistep.currentStep)}
                </Box>
            </Stack>
        </Box>
    } else {
        content = <CircularProgress />
    }

    return <Box>
        <Typography variant="h4">Invitation to a watch party</Typography>
        {content}
    </Box>
}