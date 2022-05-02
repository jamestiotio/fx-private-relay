import {
  CustomAliasData,
  RandomAliasData,
  useAliases,
  isRandomAlias,
  getAllAliases,
  getFullAddress,
  AliasUpdateFn,
  AliasDeleteFn,
  AliasCreateFn,
} from "../../../src/hooks/api/aliases";

jest.mock("../../../src/hooks/api/aliases");

// We know that `jest.mock` has turned exported functions into mock functions,
// but TypeScript can't — so we tell it using a type assertion:
const mockedUseAliases = useAliases as jest.MockedFunction<typeof useAliases>;
const mockedIsRandomAlias = isRandomAlias as jest.MockedFunction<
  typeof isRandomAlias
>;
const mockedGetAllAliases = getAllAliases as jest.MockedFunction<
  typeof getAllAliases
>;
const mockedGetFullAddress = getFullAddress as jest.MockedFunction<
  typeof getFullAddress
>;

// We only need to mock out the functions that make HTTP requests;
// restore the rest:
const actualModule = jest.requireActual(
  "../../../src/hooks/api/aliases"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any;
mockedIsRandomAlias.mockImplementation(actualModule.isRandomAlias);
mockedGetAllAliases.mockImplementation(actualModule.getAllAliases);
mockedGetFullAddress.mockImplementation(actualModule.getFullAddress);

export function getMockRandomAlias(
  alias?: Partial<RandomAliasData>
): RandomAliasData {
  return {
    type: "random",
    address: "arbitrary_address",
    full_address: `${alias?.address ?? "arbitrary_address"}@mozmail.com`,
    created_at: "2021-11-03T13:37:42.000000Z",
    last_modified_at: "2021-11-03T13:37:42.000000Z",
    last_used_at: "2021-11-03T13:37:42.000000Z",
    description: "",
    domain: 1,
    enabled: true,
    block_list_emails: false,
    generated_for: "",
    used_on: "",
    id: 0,
    num_blocked: 0,
    num_forwarded: 0,
    num_spam: 0,
    ...alias,
  };
}
export function getMockCustomAlias(
  alias?: Partial<CustomAliasData>
): CustomAliasData {
  return {
    type: "custom",
    address: "arbitrary_address",
    full_address: `${alias?.address ?? "arbitrary_address"}@custom.mozmail.com`,
    created_at: "2021-11-03T13:37:42.000000Z",
    last_modified_at: "2021-11-03T13:37:42.000000Z",
    last_used_at: "2021-11-03T13:37:42.000000Z",
    description: "",
    domain: 2,
    enabled: true,
    block_list_emails: false,
    id: 0,
    num_blocked: 0,
    num_forwarded: 0,
    num_spam: 0,
    ...alias,
  };
}

type MockData = {
  random?: Array<Partial<RandomAliasData>>;
  custom?: Array<Partial<CustomAliasData>>;
};
type Callbacks = {
  creater?: AliasCreateFn;
  updater?: AliasUpdateFn;
  deleter?: AliasDeleteFn;
};
function getReturnValue(
  aliasesData?: MockData,
  callbacks?: Callbacks
): ReturnType<typeof useAliases> {
  const randomAliasData = (aliasesData?.random || [{}]).map((alias) =>
    getMockRandomAlias(alias)
  );
  const customAliasData = (aliasesData?.custom || [{}]).map((alias) =>
    getMockCustomAlias(alias)
  );

  return {
    randomAliasData: {
      isValidating: false,
      mutate: jest.fn(),
      data: randomAliasData,
    },
    customAliasData: {
      isValidating: false,
      mutate: jest.fn(),
      data: customAliasData,
    },
    create: callbacks?.creater || jest.fn(),
    update: callbacks?.updater || jest.fn(),
    delete: callbacks?.deleter || jest.fn(),
  };
}

export const setMockAliasesData = (
  aliasesData?: MockData,
  callbacks?: Callbacks
) => {
  mockedUseAliases.mockReturnValue(getReturnValue(aliasesData, callbacks));
};

export const setMockAliasesDataOnce = (
  aliasesData?: MockData,
  callbacks?: Callbacks
) => {
  mockedUseAliases.mockReturnValueOnce(getReturnValue(aliasesData, callbacks));
};
