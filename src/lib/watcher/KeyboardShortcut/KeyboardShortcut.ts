class KeyCombination {
	_altKey = false;
	_ctrlKey = false;
	_shiftKey = false;
	_metaKey = false;
	_key: string | null = null;

	get altKey(): boolean {
		return this._altKey;
	}

	get ctrlKey(): boolean {
		return this._ctrlKey;
	}

	get shiftKey(): boolean {
		return this._shiftKey;
	}

	get metaKey(): boolean {
		return this._metaKey;
	}

	get key(): string {
		return this._key;
	}

	constructor(shortcutAsString: string) {
		shortcutAsString
			.split('+')
			.map((key) => key.toLocaleLowerCase().trim())
			.forEach((key) => {
				switch (key) {
					case 'alt':
						this._altKey = true;
						break;
					case 'ctrl':
					case 'control':
						this._ctrlKey = true;
						break;
					case 'shift':
						this._shiftKey = true;
						break;
					case 'meta':
					case 'win':
					case 'cmd':
					case 'command':
						this._metaKey = true;
						break;
					default:
						if (key.length !== 1) {
							throw `Unknown shortcut key "${key}" in shortcut "${shortcutAsString}"`;
						} else if (this._key) {
							throw `You can use only one non-modifier key. "${shortcutAsString}" has more than one.`;
						} else {
							this._key = key;
						}
				}
			});
	}

	matchFromEvent(event: KeyboardEvent): boolean {
		return (
			this.altKey === event.altKey &&
			this.ctrlKey === event.ctrlKey &&
			this.shiftKey === event.shiftKey &&
			this.metaKey === event.metaKey &&
			'key' + this.key === event.code.toLocaleLowerCase()
		);
	}
}

export class KeyboardShortcut {
	_shortcuts: KeyCombination[];

	constructor(shortcutAsString: string) {
		this._shortcuts = shortcutAsString.split(',').map((shortcut) => new KeyCombination(shortcut));
	}

	matchFromEvent(event: KeyboardEvent): boolean {
		return this._shortcuts.some((shortcut) => shortcut.matchFromEvent(event));
	}
}
