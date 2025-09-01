# Courier CLI

Take home assignment for Everest Engineering

This is a cli for a courier app, it can calculate the cost and time for a given set of packages and fleet capacity.

## Note

There is larger focus on architecture and testing than on super efficient implementation of algorithms as I'm slightly out of touch with DSA.

I have not fully implemented the time calculation due to personal time constraints. But I will keep adding to it in the comming days. I tried using backtracking to find the optimal solution but it was not working as expected hence chose to close it with a simple greedy approach.

I have taken assitance of Windsurf to generate the architecture and some of the code and tests.

## Technologies and Patters used

-- This is an interactive CLI, and does not support single commands, but I can add it if needed.
-- I have tried to use TDD(using jest itself) as much as possible, writing tests before the actual implementation, you can find the commits marked with "TDD" in the git history
-- I am curently working with Typescript at work hence chose node.js with tsc
-- I have used Zod for validation and it generated types too so it is great.


## Running the application

```bash
npm install
npm run dev

npm run test
```


### Calculate Cost


### Calculate Time


### Available Scripts

- `npm run build` - Transpiles TypeScript to JavaScript
- `npm test` - Runs Jest tests
- `npm start` - Runs the built application
- `npm run dev` - Builds and runs the application
- `npm run watch` - Watches for changes and rebuilds

### Testing

Tests are written using Jest and follow the Test-Driven Development (TDD) pattern:

```bash
npm test
```