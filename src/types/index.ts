export type ListenerType<T> = { id: string; cb: (data: T) => void }[];
