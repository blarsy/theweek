import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DateTimePicker from '@mui/lab/DateTimePicker';
import AdapterDateFns from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { Box, IconButton, AppBar, Typography, Toolbar, TextField, Stack, Button } from '@mui/material';
import { createCohort } from '../../lib/apiFacade';
import { useAppContext } from '../../lib/appState';



export default function CohortEdit({ onClose, onCohortCreated }) {
    const [state] = useAppContext();
    const emptyNewCohort = {
        autoSynchDates: true, daysInterval: 2, daysBetweenConfirmationAndEp1: 4,
        datetimeEp1: null, datetimeEp2: null, datetimeEp3: null, confirmationDeadline: null,
        warnings: [], validationErrors: {}, pristine: true
    };
    const [newCohort, setNewCohort] = useState(emptyNewCohort);

    const validateAndSaveNewCohort = async () => {
        const validationErrors = getValidationErrorsNewCohort();
        if (Object.keys(validationErrors).length === 0) {
            try {
                const result = await createCohort({
                    facilitatorAddress: state.walletAddress,
                    datetimeEp1: newCohort.datetimeEp1.toJSDate(),
                    datetimeEp2: newCohort.datetimeEp2.toJSDate(),
                    datetimeEp3: newCohort.datetimeEp3.toJSDate(),
                    confirmationDeadline: newCohort.confirmationDeadline.toJSDate()
                });
                mergeNewCohortState(emptyNewCohort);
                onCohortCreated({
                    _id: result._id,
                    facilitatorAddress: newCohort.walletAddress,
                    datetimeEp1: newCohort.datetimeEp1,
                    datetimeEp2: newCohort.datetimeEp2,
                    datetimeEp3: newCohort.datetimeEp3,
                    confirmationDeadline: newCohort.confirmationDeadline
                });
            }
            catch (e) {
                state.setError(state, 'Error while saving. Please retry, and contact us if the problem persists.');
            }
        } else {
            mergeNewCohortState({ pristine: false, validationErrors });
        }
    };
    const mergeNewCohortState = (newState, reducer) => {
        if (reducer) {
            setNewCohort({ ...newCohort, ...(reducer(newState)) });
        } else {
            setNewCohort({ ...newCohort, ...newState });
        }
    };
    const recalcDatesFromDateEp1 = ep1Date => {
        if (ep1Date) {
            if (!ep1Date.invalid) {
                return {
                    datetimeEp1: ep1Date,
                    datetimeEp2: ep1Date.plus({ days: newCohort.daysInterval }),
                    datetimeEp3: ep1Date.plus({ days: 2 * newCohort.daysInterval }),
                    confirmationDeadline: ep1Date.plus({ days: -newCohort.daysBetweenConfirmationAndEp1 })
                };
            }
            return { datetimeEp1: ep1Date };
        }
        return { datetimeEp1: null };
    };
    const validateNewCohortIfNotPristine = newCohortState => {
        if (!newCohort.pristine) {
            const validationErrors = getValidationErrorsNewCohort();
            return { ...newCohortState, ...{ validationErrors } };
        }
        return newCohortState;
    };
    const getValidationErrorsNewCohort = () => {
        const validationErrors = {};
        if (!newCohort.datetimeEp1) {
            validationErrors.datetimeEp1 = 'Required';
        } else {
            if (newCohort.datetimeEp1.invalid) {
                validationErrors.datetimeEp1 = 'Invalid date';
            }
        }
        if (!newCohort.datetimeEp2) {
            validationErrors.datetimeEp2 = 'Required';
        } else {
            if (newCohort.datetimeEp2.invalid) {
                validationErrors.datetimeEp2 = 'Invalid date';
            }
        }
        if (!newCohort.datetimeEp3) {
            validationErrors.datetimeEp3 = 'Required';
        } else {
            if (newCohort.datetimeEp3.invalid) {
                validationErrors.datetimeEp3 = 'Invalid date';
            }
        }
        if (!newCohort.confirmationDeadline) {
            validationErrors.confirmationDeadline = 'Required';
        } else {
            if (newCohort.confirmationDeadline.invalid) {
                validationErrors.confirmationDeadline = 'Invalid date';
            }
        }

        if (!validationErrors.datetimeEp1 && !validationErrors.confirmationDeadline && newCohort.datetimeEp1.toJSDate() < newCohort.confirmationDeadline.toJSDate()) {
            validationErrors.datetimeEp1 = 'Can\'t be before confirmation deadline';
        }
        if (!validationErrors.datetimeEp2 && !validationErrors.datetimeEp1 && newCohort.datetimeEp2.toJSDate() < newCohort.datetimeEp1.toJSDate()) {
            validationErrors.datetimeEp2 = 'Can\'t be before episode 1';
        }
        if (!validationErrors.datetimeEp3 && !validationErrors.datetimeEp2 && newCohort.datetimeEp3.toJSDate() < newCohort.datetimeEp2.toJSDate()) {
            validationErrors.datetimeEp3 = 'Can\'t be before episode 2';
        }
        if (!validationErrors.confirmationDeadline && newCohort.confirmationDeadline.toJSDate() < new Date()) {
            validationErrors.confirmationDeadline = 'Can\'t be in the past';
        }
        return validationErrors;
    };

    return (<LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box component="form"
            onSubmit={e => {
                e.preventDefault();
                validateAndSaveNewCohort();
            }}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => onClose()}
                        aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ flex: 1, justifyContent: 'center' }}>Create cohort</Typography>
                    <Button type="submit" color="secondary" variant="contained">Save</Button>
                </Toolbar>
            </AppBar>
            <Stack id="newCohortForm" padding={1} spacing={1} alignItems="flex-start">
                <DateTimePicker renderInput={(props) => <TextField {...props} error={!!newCohort.validationErrors.datetimeEp1} helperText={newCohort.validationErrors.datetimeEp1} />}
                    label="Episode 1"
                    value={newCohort.datetimeEp1}
                    onChange={(newValue) => {
                        if (newCohort.autoSynchDates) {
                            mergeNewCohortState(recalcDatesFromDateEp1(newValue), validateNewCohortIfNotPristine);
                        } else {
                            mergeNewCohortState({ datetimeEp1: newValue }, validateNewCohortIfNotPristine);
                        }
                    }} />
                <DateTimePicker renderInput={(props) => <TextField {...props} error={!!newCohort.validationErrors.datetimeEp2} helperText={newCohort.validationErrors.datetimeEp2} />}
                    label="Episode 2"
                    required
                    value={newCohort.datetimeEp2}
                    onChange={(newValue) => {
                        mergeNewCohortState({ datetimeEp2: newValue, autoSynchDates: false }, validateNewCohortIfNotPristine);
                    }} />
                <DateTimePicker renderInput={(props) => <TextField {...props} error={!!newCohort.validationErrors.datetimeEp3} helperText={newCohort.validationErrors.datetimeEp3} />}
                    label="Episode 3"
                    required
                    value={newCohort.datetimeEp3}
                    onChange={(newValue) => {
                        mergeNewCohortState({ datetimeEp3: newValue, autoSynchDates: false }, validateNewCohortIfNotPristine);
                    }} />
                <DateTimePicker renderInput={(props) => <TextField {...props} error={!!newCohort.validationErrors.confirmationDeadline} helperText={newCohort.validationErrors.confirmationDeadline} />}
                    label="Confirmation deadline"
                    required
                    value={newCohort.confirmationDeadline}
                    onChange={(newValue) => {
                        mergeNewCohortState({ confirmationDeadline: newValue, autoSynchDates: false }, validateNewCohortIfNotPristine);
                    }} />
            </Stack>
        </Box>
    </LocalizationProvider>);
}
