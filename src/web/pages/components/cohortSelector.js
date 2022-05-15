import { useState, useEffect } from 'react'
import { Stack, Typography, Card, CardContent, CardActions, CircularProgress } from '@mui/material'
import { DateTime, Interval } from 'luxon'
import { getAvailableCohorts } from '../../lib/apiFacade'

export default function CohortSelector({value, onChange, watchpartyCohorts}) {
    const [cohorts, setCohorts] = useState(null)

    useEffect(async () => {
        if(!cohorts) {
            const result = {
                thisWeek:[],
                nextWeek:[],
                later:[]                
            }
            let rawCohorts = await getAvailableCohorts()
            if(watchpartyCohorts)
                rawCohorts = rawCohorts.filter(cohort => watchpartyCohorts.includes(cohort._id))
                
            const endOfCurrentWeek = DateTime.now().endOf('week')
            rawCohorts.forEach(cohort => {
                const cohortEp1Datetime = DateTime.fromISO(cohort.datetimeEp1)
                if(cohortEp1Datetime.toJSDate() <= endOfCurrentWeek.toJSDate()) {
                    result.thisWeek.push(cohort)
                } else if(cohortEp1Datetime.toJSDate() <= endOfCurrentWeek.plus({ week: 1}).toJSDate()) {
                    result.nextWeek.push(cohort)
                } else {
                    result.later.push(cohort)
                }
            })
            setCohorts(result)
        }
    })

    const CohortOverPeriod = (title, cohorts, showIfEmpty, idxBasis) => {
        let result
        if(cohorts.length === 0){
            if(showIfEmpty) {
                result = [
                    <Typography key={`${idxBasis}1`} variant="h5">{title}</Typography>,
                    <Typography key={`${idxBasis}2`} variant="subtitle1">No cohort in this period</Typography>]
            } else {
                return []
            }
        } else {
            result = [
                <Typography key={`${idxBasis}1`} variant="h5">{title}</Typography>,
                <Stack key={`${idxBasis}2`} direction="row" spacing={1}>
                    {cohorts.sort((a,b) => new Date(a.datetimeEp1) - new Date(b.datetimeEp1)).map((cohort, idx) => {
                        const ep1Dt = DateTime.fromISO(cohort.datetimeEp1)
                        const ep2Dt = DateTime.fromISO(cohort.datetimeEp2)
                        const ep3Dt = DateTime.fromISO(cohort.datetimeEp3)

                        return <Card key={idx} sx={{ 
                            cursor: 'pointer', 
                            backgroundColor: value.includes(cohort._id) ? 'rgb(204, 232, 205)' : 'rgb(244, 199, 199)' 
                        }}  onClick={() => {
                            if(value.includes(cohort._id)) {
                                onChange(value.filter(id => id != cohort._id))
                            } else {
                                onChange([...value, cohort._id])
                            }
                        }}>
                            <CardContent>
                                <Stack alignItems="center">
                                    <Typography variant="h4">{ep1Dt.toLocaleString({day: 'numeric'})}</Typography>
                                    <Typography variant="subtitle1">{ep1Dt.toLocaleString({month: 'short'})}</Typography>
                                    <Typography variant="subtitle2">Ep2: {ep2Dt.toLocaleString({day: 'numeric', month: 'short'})} - Ep3: {ep3Dt.toLocaleString({day: 'numeric', month: 'short'})}</Typography>
                                    <Typography variant="subtitle2">Closes in {Interval.fromDateTimes(new Date(), new Date(cohort.confirmationDeadline)).toDuration(['days', 'hours', 'minutes']).toHuman({ maximumFractionDigits: 0 })}</Typography>
                                </Stack>
                            </CardContent>
                            <CardActions sx={{justifyContent: 'center'}}>
                                <Typography variant="h4">{value.includes(cohort._id) ? 'Available' : 'Available ?'}</Typography>
                              </CardActions>
                        </Card>
                    })}
                </Stack>]
        }
        return result
    }

    return (<Stack>
        <Typography variant="h4">Available cohorts</Typography>
        { cohorts &&
            [
                ...CohortOverPeriod('This week', cohorts.thisWeek, true, 1),
                ...CohortOverPeriod('Next week', cohorts.nextWeek, false, 2),
                ...CohortOverPeriod('Later', cohorts.later, true, 3),
                
            ]}
        { !cohorts && <CircularProgress />}
    </Stack>)
}