import { ClientOptions } from "../models/client-options";
import { Team } from "../models/constants";

interface Reader {
  name: string;
  set: (options: ClientOptions, val: string) => void;
}

const READERS: Reader[] = [
    { name: "n", set: (o, v) => (o.name = v) },
    { name: "t", set: (o, v) => (o.team = +v) },
    { name: "hc", set: (o, v) => (o.handicap = +v) },
    { name: "skill", set: (o, v) => (o.skill = +v || 5) },
    { name: "id", set: (o, v) => (o.id = v) },
];

export class ClientOptionsParser {
  public parse(data: string): ClientOptions {
    const options: ClientOptions = {
      id: "",
      name: "",
      team: Team.SPECTATOR
    };
    const ary = data.split("\\");
    if (ary[0] === "") {
      ary.shift();
    }
    for (let i = 0; i < ary.length - 1; i++) {
        const reader = READERS.find(r => r.name === ary[i]);
        if (reader) {
            reader.set(options, ary[i + 1]);
        }
    }

    return options;
  }
}
