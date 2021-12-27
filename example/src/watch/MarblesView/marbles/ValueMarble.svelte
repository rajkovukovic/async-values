<script lang="ts">
  export let x: number = 0;
  export let y: number = 0;
  export let size: number = 10;
</script>

<circle
  cx={x}
  cy={y}
  r={size / 2}
  fill="#007ACC"
  on:click
/>