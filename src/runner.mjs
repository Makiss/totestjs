import path from "path";

export const run = async () => {
  try {
    await import(path.resolve(process.cwd(), "../example/test/tests.mjs"));
  } catch (e) {
    console.error(e);
  }
  console.log("Test run finished");
};
