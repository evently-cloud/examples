# Table Tennis

This is an application that stress-tests evently by creating thousands of realistic events and hydrating them to simulate a high-speed CQRS-ES application.

### Instructions

1. Acquire an Evently access token at https://evently.cloud.

2. Create an env file at the root of the module called `evently.env` with the following properties:

   ```shell
   EVENTLY_URL=https://preview.evently.cloud
   EVENTLY_ONLINE=true
   EVENTLY_TOKEN=<your-token-here>
   EVENTLY_RESET_LEDGER=false
   TOURNEY_COUNT=1
   ```

3. Then in a terminal, run the application with the following command:

```bash
env yarn play
```

#### Resetting the Ledger

```bash
env EVENTLY_RESET_LEDGER=true yarn play
```

This sets the `EVENTLY_RESET_LEDGER` environment variable to true, which will tell the application to register the tenant and event types before running a tournament.

#### Concurrent Play

Table Tennis can run concurrent tournaments, which increases the stress on the event store. Use this command:

```shell
env TOURNEY_COUNT=4 yarn play
```

This will launch 4 concurrent tournaments. At the end of the run, the app will emit benchmarks for each tournament.
