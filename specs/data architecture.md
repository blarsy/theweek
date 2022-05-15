# Data architecture
## Generalities
All data needing to be persisted are stored in a number of OrbitDb databases.
The only exception is the management of tokens, which are of course handled by one or more contracts on Polygon.
## List of OrbitDb databases
- roles: kvStore:
```json
[
    {
        address, // Polygon address
        role // For the moment, can only be "Facilitator", and more possible value would come if we generalize the tool for other usages than "The week" watch parties
    }
]
```
- cohorts: docs database, with properties:
```json
{
    facilitatorAddress: string, // Polygon address of the facilitator who created the cohort
    datetimeEp1: DatetimeUTC, // Non-nullable, date and time of the visionning of "The week" episode 1, and of the facilitatated conversation that follows immediately
    datetimeEp2: DatetimeUTC, // Non-nullable, date and time of the visionning of "The week" episode 2, and of the facilitatated conversation that follows immediately
    datetimeEp3: DatetimeUTC // Non-nullable, date and time of the visionning of "The week" episode 3, and of the facilitatated conversation that follows immediately
}
```
- watchparties: docs database, with properties:
```json
{
    name: string, // Non-nullable, given by the organizer
    slug: string, // Non-nullable, derived from the name, used to create a unique url for the watch party, for use in invitations and facilitator management ui
    organizerAddress: string, // Non-nullable, Polygon address of the organizer
    confirmationDeadline: ID, // Non-nullable, set by the organizer upon creation of the watch party
    availabilities: { // Nullable, array, each participant picks one or more cohort he is available at
        participantAddress: string, // Non nullable, Polygon address of the participant
        availableCohorts: [ID], // Non nullable, list of IDs of the cohorts the participants has picked
        stakeTx: string // Non nullable, transaction id of the call to the Polygon contract that takes care of holding the gas tokens put at stake by the participant
    },
    confirmedCohort: DatetimeUTC // Nullable, the web app sets this field to the cohort that collected the greatest amount of participants availabilities
}
```
