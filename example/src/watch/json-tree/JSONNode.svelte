<script>
	import JSONObjectNode from './JSONObjectNode.svelte';
	import JSONArrayNode from './JSONArrayNode.svelte';
	import JSONIterableArrayNode from './JSONIterableArrayNode.svelte';
	import JSONIterableMapNode from './JSONIterableMapNode.svelte';
	import JSONMapEntryNode from './JSONMapEntryNode.svelte';
	import JSONValueNode from './JSONValueNode.svelte';
	import ErrorNode from './ErrorNode.svelte';
	import objType from './objType';
	import { TimeStampView } from '../EventsView/TimeStampView';
	import { timestampViewStore } from '../EventsView/preferences';

	export let key, value, isParentExpanded, isParentArray;
	$: nodeType = objType(value);
	$: componentType = getComponent(nodeType);
	$: valueGetter = getValueGetter(nodeType, $timestampViewStore);

	function getComponent(nodeType) {
		switch (nodeType) {
			case 'Object':
				return JSONObjectNode;
			case 'Error':
				return ErrorNode;
			case 'Array':
				return JSONArrayNode;
			case 'Iterable':
			case 'Map':
			case 'Set':
				return typeof value.set === 'function' ? JSONIterableMapNode : JSONIterableArrayNode;
			case 'MapEntry':
				return JSONMapEntryNode;
			default:
				return JSONValueNode;
		}
	}

	function formatMilliSeconds(milliSeconds) {
		let seconds = Math.floor(milliSeconds / 1000);
		milliSeconds = milliSeconds % 1000;
		if (milliSeconds === 0) return '-';

		let minutes = Math.floor(seconds / 60);
		seconds = seconds % 60;

		return minutes !== 0
			? `+${minutes.toString().padStart(2, '0')}:${seconds
					.toString()
					.padStart(2, '0')}.${milliSeconds.toString().padStart(3, '0')}`
			: `+${seconds.toString()}.${milliSeconds.toString().padStart(3, '0')}`;
	}

	function getValueGetter(nodeType, timeStampView) {
		switch (nodeType) {
			case 'Object':
			case 'Error':
			case 'Array':
			case 'Iterable':
			case 'Map':
			case 'Set':
			case 'MapEntry':
			case 'Number':
				return undefined;
			case 'String':
				return (raw) => `"${raw}"`;
			case 'Boolean':
				return (raw) => (raw ? 'true' : 'false');
			case 'Date':
				switch (timeStampView) {
					case TimeStampView.absoluteDateAndTime:
						return (raw) => raw.toISOString();
					case TimeStampView.absoluteTime:
						return (raw) => raw.toISOString().split('T')[1].split('Z')[0];
					case TimeStampView.timeSinceAppStart:
						return (raw) => `[ ${formatMilliSeconds(raw - raw.initTimestamp)} ]`;
					default:
						return (raw) =>
							raw.previousTimestamp ? '+' + formatMilliSeconds(raw - raw.previousTimestamp) : '0';
				}
			case 'Null':
				return () => 'null';
			case 'Undefined':
				return () => 'undefined';
			case 'Function':
			case 'Symbol':
				return (raw) => raw.toString();
			default:
				return () => `<${nodeType}>`;
		}
	}
</script>

<svelte:component
	this={componentType}
	{key}
	{value}
	{isParentExpanded}
	{isParentArray}
	{nodeType}
	{valueGetter}
/>
