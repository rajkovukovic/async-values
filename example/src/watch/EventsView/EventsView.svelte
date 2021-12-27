<script lang="ts">
	import { AVWatch } from '../AVWatch/AVWatch';
	import MarblesView from '../MarblesView/MarblesView.svelte';
	import Preferences from './Preferences.svelte';

  $: visibleStreams = AVWatch.visibleStreams;
  $: console.log('visibleStreams', $visibleStreams);
</script>

<!-- <Preferences /> -->
<MarblesView eventsStream={AVWatch.events} visibleStreams={AVWatch.visibleStreams} />
