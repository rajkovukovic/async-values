<script lang="ts">
	import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
	import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';

	export let eventsCollectionStream: Observable<any>;
	export let visibleStreamsStream: Observable<any>;

	$: eventsStream = $eventsCollectionStream?.find().$;

  $: eventsCounts = $eventsStream?.length ?? 0;

	const pixelsPerSecondStream = new BehaviorSubject(200);

	$: firstEventStream = $eventsCollectionStream?.findOne().sort({ id: 'asc' }).$;
	$: lastEventStream = $eventsCollectionStream?.findOne().sort({ id: 'desc' }).$;

	$: console.log({ events: $eventsStream, visibleStreams: $visibleStreamsStream });
	// $: console.log({ eventsCollectionStream, firstEventStream, firstEvent: $firstEventStream });
	$: console.log({ firstEvent: $firstEventStream });
	$: console.log({ lastEvent: $lastEventStream });

	// const lastEventStream = AVWatch.events.pipe(
	//   switchMap(db => db.query({
	//       fields: ['timestamp'],
	//       // sort: [{timestamp: 'asc'}],
	//       // limit: 1,
	//     } as any)
	//   ),
	//   shareReplay(1),
	// );

	const streamNameContainerHeight = 20;
	const streamContainerHeight = 30;

	const streamRowLayout = visibleStreamsStream.pipe(
		map((streams) =>
			streams.reduce((acc, stream, index) => {
				console.log({ acc, stream, index });
				return [
					...acc,
					{
						top: index === 0 ? 0 : acc[index - 1].top + acc[index - 1].height,
						height: streamNameContainerHeight + stream.phases.length * streamContainerHeight
					}
				];
			}, [])
		),
		shareReplay(1)
	);

	const viewHeight = streamRowLayout.pipe(
		map((rowLayouts) =>
			rowLayouts.length > 0
				? rowLayouts[rowLayouts.length - 1].top + rowLayouts[rowLayouts.length - 1].height
				: 0
		),
		distinctUntilChanged(),
		shareReplay(1)
	);

	$: console.log('streamRowLayout', $streamRowLayout);
	$: console.log('viewHeight', $viewHeight);
	$: console.log('eventsCounts', eventsCounts);
</script>

<div class="wrapper">
	<svg />
</div>

<style>
	.wrapper {
		overflow: auto;
	}
</style>
