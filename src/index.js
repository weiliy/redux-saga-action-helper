
// @flow
export type Action = {
  type: any,
  payload?: any,
  meta?: any,
};

export type ErrorAction = {
  type: any,
  payload?: Error,
  error: true,
  meta?: any,
};

export type ActionCreatorFunc = (...args: Array<any>) => Action;

export type ActionCreator = {
  $call: ActionCreatorFunc,
  prefix: string,
  type: string,
  trigger: string,
  succ: string,
  fail: string,
  success: string,
  failure: string,
  sendSucc: (any, ?any) => Action,
  sendFail: (Error, ?any) => Action,
};

const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

export const success = (type: string): string => `${type}_${SUCCESS}`;
export const failure = (type: string): string => `${type}_${FAILURE}`;

export const sendSucc = (
  a: ActionCreator | string,
) => (
  payload: any,
  meta: ?any,
): Action => ({
  type: typeof a === 'string' ? a : a.succ,
  payload,
  meta,
});

export const sendFail = (
  a: ActionCreator | string,
) => (
  e: any,
  meta?: any,
): ErrorAction => ({
  type: typeof a === 'string' ? a : a.fail,
  payload: e,
  error: true,
  meta,
});

export const action = (prefix?: string) => (
  (type: string, payloadCreator: any, metaCreator?: any): ActionCreator => {
    const trigger = prefix ? `${prefix}/${type}` : type;

    function actionCreator(...payload: Array<any>): Action {
      const result: Action = {
        type: trigger,
      };

      if (payloadCreator) {
        result.payload = typeof payloadCreator === 'function'
          ? payloadCreator(...payload)
          : payloadCreator;
      }

      if (metaCreator) {
        result.meta = typeof metaCreator === 'function'
          ? metaCreator(...payload)
          : metaCreator;
      }

      return result;
    }

    const inner = prefix
      ? action()(type, payloadCreator, metaCreator)
      : actionCreator;

    const succ = success(type);
    const fail = failure(type);

    const foo = {};
    foo.prefix = prefix;
    foo.type = type;
    foo.succ = succ;
    foo.fail = fail;
    foo.trigger = trigger;
    foo.success = success(trigger);
    foo.failure = failure(trigger);
    foo.inner = inner;
    foo.sendSucc = sendSucc(succ);
    foo.sendFail = sendFail(fail);

    return Object.assign(actionCreator, foo);
  }
);

