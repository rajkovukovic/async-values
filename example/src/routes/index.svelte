<script lang="ts">
  import { interval } from 'rxjs';
  import { AVWatch, watch } from '../watch/AVWatch';
  import MarblesView from '../watch/components/MarblesView.svelte';

  interval(5000).pipe(watch('interval-2s')).subscribe(console.warn);
</script>

<MarblesView
  eventsCollectionStream={AVWatch.eventsCollection}
  visibleStreamsStream={AVWatch.visibleStreams}
/>
