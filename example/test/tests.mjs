import { emptyTodo, markAsDone } from "../todo.mjs";
import { TodoRepository } from "../TodoRepository.mjs";
import { beforeEach, describe, expect, it } from "../../src/runner.mjs";

describe("todo", () => {
  it("sets completedAt when calling markAsDone", () => {
    const todo = emptyTodo();

    expect(markAsDone(todo).completedAt).toBeDefined();
  });
});

describe("TodoRepository", () => {
  const newTodo = { ...emptyTodo(), title: "test" };
  let repository;

  beforeEach(() => {
    repository = new TodoRepository();
  });

  describe("add method", () => {
    it("throws an exception when adding a todo without a title", () => {
      expect(() => repository.add(emptyTodo())).toThrow(
        new Error("title cannot be blank")
      );
    });

    it("throws errors when adding a repeated todo", () => {
      repository.add(newTodo);

      const repeatedTodo = { ...newTodo };

      expect(() => repository.add(repeatedTodo)).toThrow(
        new Error("todo already exists")
      );
    });
  });

  describe("findAllMatching method", () => {
    beforeEach(() => {
      repository.add(newTodo);
    });

    it("finds an added todo", () => {
      expect(repository.findAllMatching("")).toHaveLength(1);
    });

    it("filters out todos that do not match filter", () => {
      expect(repository.findAllMatching("some other test")).toHaveLength(0);
    });
  });
});
