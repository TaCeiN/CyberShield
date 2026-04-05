const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function createGameSocket(missionId: string, onMessage: (data: Record<string, unknown>) => void) {
  const ws = new WebSocket(`${WS_URL}/ws/game/${missionId}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      // ignore parse errors
    }
  };

  return ws;
}
