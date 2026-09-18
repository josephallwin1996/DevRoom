import type {
  EventId,
  RequestId,
  Timestamp,
} from './types/ids';

export interface ClientEvent<TPayload = unknown> {
  type: string;
  requestId: RequestId;
  timestamp: number;
  payload: TPayload;
}

export interface ServerEvent<TPayload = unknown> {
  type: string;
  eventId: EventId;
  timestamp: number;
  payload: TPayload;
}

export interface AckEvent<TPayload = unknown> {
  type: string;
  requestId: RequestId;
  timestamp: number;
  payload: TPayload;
}

export interface SocketError {
  type: 'error';
  requestId?: RequestId;
  timestamp: number;
  payload: {
    code: string;
    message: string;
    details?: unknown;
  };
}