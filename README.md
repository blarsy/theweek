# theweek
Organize a watch party of THE WEEK in your DAO

## Goal
Facilitate the organization of watch parties within DAOs. Reward people for organizing / watching / facilitating.

## Why?
DAOs are looking for ways to create more relationship between their members. Organizing a watch party is a great opportunity to create a shared experience, it's a team bonding exercise, an opportunity to get to know new people in the community with whom we may work together on some projects in the future.

## Working group

- [Meeting notes](https://docs.google.com/document/d/1KaIXM17XQCDCiD4lxVLoVjd34-GBtZwy3_pkWrSa17g/edit#)
- Discord: https://discord.allforclimate.earth #developers-for-climate

## User story (MVP)

I'm a member of a DAO (e.g. Gitcoin DAO) and I see a link that invites me to watch together with fellow Gitcoin DAO members THE WEEK, a 3-episode documentary on the Climate Emergency. I click and I see different possible cohorts (e.g. next Monday/Tuesday/Wednesday 8pm CET, next Tuesday/Wednesday/Thurday 9pm CET, etc.).

Possible link url: `theweek.earth/watch/cohorts/$DAO_TOKEN_CONTRACT`

I can see how many people are already registered for each. I pick one cohort that suits me.

To register, I have to connect my metamask to prove that I own some tokens of the DAO (in this case GTC tokens, hence the `$DAO_TOKEN_CONTRACT` in the URL) and I need to stake 6 MATIC on Polygon that I will get back at the end (or if the cohort is cancelled by lack of registrations). I also need to provide an email address and a name or username/pseudonym.

Once the cohort is confirmed (i.e. once there is at least 3 people confirmed, max 8), an email is sent to everyone with a calendar invite with the link to the YouTUBE video and a link to the Zoom call for the conversation. 

A facilitator is designated that will send an email to the participants to share the YouTube Video and the Zoom link.
The facilitator will then send a POAP at the end of each episode.

At the end, the stake is refunded to everyone and people receive THEWEEK tokens on Polygon for having participated.
The facilitator also gets the same amount of tokens.

## Design
- [UX wireframe](https://www.figma.com/file/Ce06zZ2wB5I5WuT3rq7WP8/theweek?node-id=0%3A1)

