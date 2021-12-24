<script lang="ts">
  import { interval } from 'rxjs';
  import MarblesView from '../watch/components/MarblesView.svelte';

  // add some strams to AVWatcher
  interval(1000);
  
</script>

<MarblesView />
