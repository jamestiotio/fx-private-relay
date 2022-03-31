import { it, expect } from "@jest/globals";
import {
  AliasData,
  CustomAliasData,
  RandomAliasData,
} from "../hooks/api/aliases";
import { filterAliases, Filters } from "./filterAliases";

const getMockedAliasMatching = (filters: Partial<Filters>): AliasData => {
  const alias: CustomAliasData | RandomAliasData = {
    address: filters.string ?? "arbitrary_string",
    full_address:
      filters.domainType === "custom"
        ? `${filters.string ?? "arbitrary_string"}@some.mozmail.com`
        : `${filters.string ?? "arbitrary_string"}@mozmail.com`,
    created_at: "2021-11-08T13:46:40.899003Z",
    description: "",
    domain: 2,
    enabled: filters.status !== "blocking",
    id: 42,
    last_modified_at: "2021-11-08T13:46:40.899003Z",
    last_used_at: null,
    num_blocked: 0,
    num_forwarded: 0,
    num_spam: 0,
  };
  if (filters.domainType === "random") {
    (alias as RandomAliasData).generated_for = "";
    (alias as RandomAliasData).type = "random";
  }
  return alias;
};
const getOneOfEvery = (): AliasData[] => {
  return [
    getMockedAliasMatching({
      string: "some_string",
      domainType: "custom",
      status: "blocking",
    }),
    getMockedAliasMatching({
      string: "other_string",
      domainType: "custom",
      status: "blocking",
    }),
    getMockedAliasMatching({
      string: "some_string",
      domainType: "random",
      status: "blocking",
    }),
    getMockedAliasMatching({
      string: "other_string",
      domainType: "random",
      status: "blocking",
    }),
    getMockedAliasMatching({
      string: "some_string",
      domainType: "custom",
      status: "forwarding",
    }),
    getMockedAliasMatching({
      string: "other_string",
      domainType: "custom",
      status: "forwarding",
    }),
    getMockedAliasMatching({
      string: "some_string",
      domainType: "random",
      status: "forwarding",
    }),
    getMockedAliasMatching({
      string: "other_string",
      domainType: "random",
      status: "forwarding",
    }),
  ];
};

it("returns all aliases if no filters are active", () => {
  const aliases = getOneOfEvery();

  expect(filterAliases(aliases, { string: "" })).toStrictEqual(aliases);
});

it("filters out aliases that do not match the given string", () => {
  const aliases = [
    getMockedAliasMatching({ string: "some_string" }),
    getMockedAliasMatching({ string: "other_string" }),
  ];

  expect(filterAliases(aliases, { string: "some" })).toStrictEqual([
    aliases[0],
  ]);
});

it("can match on an alias's subdomain when using a string filter", () => {
  const aliases = [
    getMockedAliasMatching({ domainType: "random" }),
    getMockedAliasMatching({ domainType: "custom" }),
  ];

  expect(filterAliases(aliases, { string: "some" })).toStrictEqual([
    aliases[1],
  ]);
});

it("can filter out non-random domains", () => {
  const aliases = [
    getMockedAliasMatching({ domainType: "random" }),
    getMockedAliasMatching({ domainType: "custom" }),
  ];

  expect(
    filterAliases(aliases, { string: "", domainType: "random" })
  ).toStrictEqual([aliases[0]]);
});

it("can filter out non-random domains", () => {
  const aliases = [
    getMockedAliasMatching({ domainType: "random" }),
    getMockedAliasMatching({ domainType: "custom" }),
  ];

  expect(
    filterAliases(aliases, { string: "", domainType: "custom" })
  ).toStrictEqual([aliases[1]]);
});

it("can filter out blocking aliases", () => {
  const aliases = [
    getMockedAliasMatching({ status: "blocking" }),
    getMockedAliasMatching({ status: "forwarding" }),
  ];

  expect(
    filterAliases(aliases, { string: "", status: "forwarding" })
  ).toStrictEqual([aliases[1]]);
});

it("can filter out forwarding aliases", () => {
  const aliases = [
    getMockedAliasMatching({ status: "blocking" }),
    getMockedAliasMatching({ status: "forwarding" }),
  ];

  expect(
    filterAliases(aliases, { string: "", status: "blocking" })
  ).toStrictEqual([aliases[0]]);
});

it("can combine filters", () => {
  const aliases = [
    getMockedAliasMatching({ string: "some_string", status: "blocking" }),
    getMockedAliasMatching({ string: "some_string", status: "forwarding" }),
    getMockedAliasMatching({ string: "other_string", status: "blocking" }),
    getMockedAliasMatching({ string: "other_string", status: "forwarding" }),
  ];

  expect(
    filterAliases(aliases, { string: "some", status: "forwarding" })
  ).toStrictEqual([aliases[1]]);
});
