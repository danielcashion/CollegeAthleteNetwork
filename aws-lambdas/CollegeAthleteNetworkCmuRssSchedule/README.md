# CMU PrestoSports RSS schedule Lambda

Nightly harvest of Carnegie Mellon (configurable) PrestoSports RSS schedules into TourneyMaster `games_scrape_stg`.

## Build & test

```bash
cd aws-lambdas/CollegeAthleteNetworkCmuRssSchedule
npm ci
npm test
npm run build
```

## Local invoke (DRY_RUN)

```bash
npm run build
sam build
sam local invoke CmuRssFunction --event events/scheduled-empty.json --env-vars env.local.json
```

Set `DRY_RUN=false` in `env.local.json` only when intentionally posting to publicprod.

## Deploy

```bash
npm run build
sam build
sam deploy
```

RSS → `games` upserts are handled by a **separate RSS cleanup stored procedure** (not invoked by this Lambda).
