import path from "path";
import { color } from "./colors.mjs";

let successes = 0;
let failures = 0;
const exitCodes = {
  OK: 0,
  FAILURE: 1,
};

export const run = async () => {
  try {
    await import(path.resolve(process.cwd(), "../example/test/tests.mjs"));
  } catch (e) {
    console.error(e);
  }
  console.log(
    color(
      `<green>${successes}</green> test(s) passed, <red>${failures}</red> test(s) failed.`
    )
  );

  process.exit(failures !== 0 ? exitCodes.FAILURE : exitCodes.OK);
};

export const it = (name, body) => {
  try {
    body();
    successes++;
  } catch (e) {
    console.error(color(`<red>${name}</red>`));
    console.error(e);
    failures++;
  }
};
