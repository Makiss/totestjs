import path from "path";
import { color } from "./colors.mjs";

export const run = async () => {
  try {
    await import(path.resolve(process.cwd(), "../example/test/tests.mjs"));
  } catch (e) {
    console.error(e);
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
  try {
    invokeBefores();
    body();
    invokeAfters();
    console.log(indent(color(`<green>${tick}</green> ${name}`)));
    successes++;
  } catch (e) {
    console.log(indent(color(`<red>${cross}</red> ${name}`)));
    failures.push({
      error: e,
      name,
      describeStack,
    });
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
  console.error(failure.error);
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

let successes = 0;
let failures = [];
const exitCodes = {
  OK: 0,
  FAILURE: 1,
};
const tick = "\u2713";
const cross = "\u2717";
let describeStack = [];
