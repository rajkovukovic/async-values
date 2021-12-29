# async-values

## How to try

`yarn install && yarn dev`

See the demo code in [src/routes/index.svelte](src/routes/index.svelte)

## How to build component library

`yarn install && yarn package`

files are in `dist` folder

## How to build demo application

`yarn install && yarn build`

files are in `build` folder

## How to use Watcher in my project
```js
// activate plugin in the top level file of the project
onMount(() => isDev && AVWatch.activate(true));

// watch Subject
const userId = new BehaviorSubject(0);
watchStream('userId', userId);

// watch stream pipe chain
const user = userId.pipe(
  watchStream('user', 'beforeFetch'),
  switchMap(userId => fromFetch('//my-api.com/users/' + userId)),
  watchStream('user', 'afterFetch'),
  switchMap(response => response.json()),
  watchStream('user', 'afterParsing'),
);

// Press Ctrl + Alt to view the Watcher

// While the Watcher is open, press H for help and shortcuts
```
