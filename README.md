# Courier CLI

Take home assignment for Everest Engineering: courier cli

## Configuration

The coupon codes and the courier rate are configurable via respective json files in the configs folder.

## Running the application

The cli has two modes, interactive and subcommand, interactive will give you a menu but subcommand will be used for automation tests incase you guys are using that.

### Interactive mode:

```bash
npm install
npm run dev
```

### Subcommand mode:

```bash
npm install && npm run build
node dist/index.js <subcommand>
```

Available subcommands:

- calculatecost
- calculateTime

## Technologies and Patters used

-- I have tried to use TDD(using jest itself) as much as possible, writing tests before the actual implementation, you can find the commits marked with "TDD" in the git history
-- I am curently working with Typescript at work hence chose node.js with tsc
-- I have used Zod for validation and it generated types too so it is great.

## Note

I have done my best to implement the time calculation algorithm using greedy and a another approach using backtracking, couldn't give fullest due to personal time constraints. I am out of touch with DSA due to worloads at my current org.

I have taken assitance of Windsurf to generate the architecture and some of the code and tests.

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