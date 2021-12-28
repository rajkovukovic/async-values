export type ConvertibleToAsyncError = string | Error | AsyncError;

export class AsyncError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AsyncError';
	}

	toString(): string {
		return this.message;
	}

	static from(error: ConvertibleToAsyncError) {
		if (error instanceof AsyncError) return error;

		if (error instanceof Error) {
			const asyncError = new AsyncError(error.message);
			asyncError.stack = error.stack;
			(asyncError as any).originalError = error;
			return asyncError;
		}

		return new AsyncError(String(error));
	}
}
