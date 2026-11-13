import { trainAndEvaluate, type TrainRequest, type TrainResult } from './train';

export type TrainMessage =
  | { type: 'progress'; episode: number; avgWait: number }
  | ({ type: 'done' } & TrainResult);

self.onmessage = (event: MessageEvent<TrainRequest>) => {
  const result = trainAndEvaluate(event.data, (episode, avgWait) => {
    postMessage({ type: 'progress', episode, avgWait } satisfies TrainMessage);
  });
  postMessage({ type: 'done', ...result } satisfies TrainMessage);
};
