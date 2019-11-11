import { ClientOptionsParser } from "./client-option-parser";
import { ClientOptions } from "../models/client-options";
import expect = require("expect");
import { Team } from "../models/constants";

describe("ClientOptionParser", () => {
  let parser: ClientOptionsParser;
  beforeEach(() => {
    parser = new ClientOptionsParser();
  });
  it("should handle invalid chars", () => {
    const options: ClientOptions = parser.parse(
      "n\\MYNAME\\t\\3\\model\\sarge/classicred\\hmodel\\sarge/classicred\\g_redteam\\\\g_blueteam\\\\c1\\0\\model\\sarge/classicblue\\headmodel\\sarge/classicblue\\team_model\\sarge/classicblue\\team_headmode=/\\c2\\\\hc\\100\\w\\0\\l\\0\\tt\\0\\tl\\0\\id\\MYID"
    );
    expect(options).toEqual({
      name: "MYNAME",
      id: "MYID",
      handicap: 100,
      team: Team.SPECTATOR
    } as ClientOptions);
  });
});
