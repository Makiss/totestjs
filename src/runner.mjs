import path from "path";
import { color } from "./colors.mjs";
import * as matchers from "./matchers.mjs";
import { ExpectationError } from "./ExpectationError.mjs";
import { formatStackTrace } from "./stackTraceFormatter.mjs";

Error.prepareStackTrace = formatStackTrace;

export const run = async () => {
  try {
    await import(path.resolve(process.cwd(), "../example/test/tests.mjs"));
  } catch (e) {
    console.error(e.message);
    console.error(e.stack);
  }
  printFailures();
  console.log(
    color(
      `<green>${successes}</green> test(s) passed, <red>${failures.length}</red> test(s) failed.`
    )
  );

  process.exit(failures !== 0 ? exitCodes.FAILURE : exitCodes.OK);
};

export const it = (name, body) => {
  currentTest = makeTest(name);
  try {
    invokeBefores();
    body();
    invokeAfters();
  } catch (e) {
    currentTest.errors.push(e);
  }

  if (currentTest.errors.length > 0) {
    console.log(indent(color(`<red>${cross}</red> ${name}`)));
    failures.push(currentTest);
  } else {
    console.log(indent(color(`<green>${tick}</green> ${name}`)));
    successes++;
  }
};

export const describe = (name, body) => {
  console.log(indent(name));
  describeStack = [...describeStack, makeDescribe(name)];
  body();
  describeStack = withoutLast(describeStack);
};

export const afterEach = (body) =>
  updateDescribe({
    afters: [...currentDescribe().afters, body],
  });

export const beforeEach = (body) =>
  updateDescribe({
    befores: [...currentDescribe().befores, body],
  });

export const expect = (actual) => new Proxy({}, matcherHandler(actual));

const matcherHandler = (actual) => ({
  get:
    (_, name) =>
    (...args) => {
      try {
        matchers[name](actual, ...args);
      } catch (e) {
        if (e instanceof ExpectationError) {
          currentTest.errors.push(e);
        } else {
          throw e;
        }
      }
    },
});

const currentDescribe = () => last(describeStack);

const updateDescribe = (newProps) => {
  const newDescribe = {
    ...currentDescribe(),
    ...newProps,
  };
  describeStack = [...withoutLast(describeStack), newDescribe];
};

const invokeAfters = () =>
  invokeAll(describeStack.flatMap((describe) => describe.afters));

const invokeBefores = () =>
  invokeAll(describeStack.flatMap((describe) => describe.befores));

const makeDescribe = (name) => ({
  name,
  befores: [],
  afters: [],
});

const printFailure = (failure) => {
  console.error(color(fullTestDescription(failure)));
  failure.errors.forEach((error) => {
    console.error(error.message);
    console.error(error.stack);
  });
  console.error("");
};

const printFailures = () => {
  if (failures.length > 0) {
    console.error("");
    console.error("Failures:");
    console.error("");
  }
  failures.forEach(printFailure);
};

const fullTestDescription = ({ name, describeStack }) =>
  [...describeStack, { name }]
    .map(({ name }) => `<bold>${name}</bold>`)
    .join(" → ");

const withoutLast = (arr) => arr.slice(0, -1);

const indent = (message) => `${" ".repeat(describeStack.length * 2)}${message}`;

const last = (arr) => arr.at(-1);

const invokeAll = (fnArray) => fnArray.forEach((fn) => fn());

const makeTest = (name) => ({
  name,
  errors: [],
  describeStack,
});

let successes = 0;
let failures = [];
const exitCodes = {
  OK: 0,
  FAILURE: 1,
};
const tick = "\u2713";
const cross = "\u2717";
let describeStack = [];
let currentTest;
