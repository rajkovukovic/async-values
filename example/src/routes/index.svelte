<script lang="ts">
  import { interval } from 'rxjs';
  import { AVWatch, watch } from '../watch/AVWatch';
  import MarblesView from '../watch/components/MarblesView.svelte';

</script>

<MarblesView
  eventsCollectionStream={AVWatch.eventsCollection}
  visibleStreamsStream={AVWatch.visibleStreams}
/>
