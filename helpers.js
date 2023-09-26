import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

export async function getOriginalJSON() {
  const ORACLE_FILEPATH = "./oracles.json";
  const filename = new URL(ORACLE_FILEPATH, import.meta.url);
  try {
    const json_file = await readFile(filename, { encoding: "utf8" });
    const data = JSON.parse(json_file);
    return data;
  } catch (err) {
    if (err instanceof Error && err.code === "ENOENT") {
      // If file doesn't exist, download it and return
      const FILE_URL =
        "https://raw.githubusercontent.com/rsek/dataforged/main/dist/starforged/oracles.json";
      console.log("Fetching original Dataforged file from GitHub...");
      const resp = await fetch(FILE_URL);
      const body = Readable.fromWeb(resp.body);
      const dl_write_stream = createWriteStream(ORACLE_FILEPATH);
      await finished(body.pipe(dl_write_stream));
      console.log("File saved as 'oracles.json'");
      return await getOriginalJSON();
    }
    throw err;
  }
}

export async function createFile(filename, obj) {
  if (typeof filename !== "string") {
    throw new Error("Filename must be a string.");
  }
  try {
    const dist_path = new URL("./dist", import.meta.url);
    await mkdir(dist_path);
  } catch (err) {
    if (err instanceof Error && err.code !== "EEXIST") throw err;
  }
  const path = new URL(`./dist/${filename}.json`, import.meta.url);
  await writeFile(path, JSON.stringify(obj));
  console.log(`FILE ${filename}.json created~`);
}

export function findById(id, arr) {
  const item = arr.find((obj) => obj["$id"] === id);
  if (!item) throw new Error(`Could not find ID ${id}`);
  return item;
}

export function findByName(name, arr) {
  const item = arr.find((obj) => obj["Name"] === name);
  if (!item) throw new Error(`Could not find NAME ${name}`);
  return item;
}

function convertMarkdown(str) {
  const mdRegex = /\[.+\]\(.+\)/gm;
  const titleRegex = /\[⏵(.+)\]/gm;
  const match = str.match(mdRegex);
  if (!match) return str;

  const matches = [...str.matchAll(titleRegex)][0];
  if (str.includes("Core")) {
    // Reference core oracles
    return matches[1] + " (core)";
  } else if (str.includes("Vault")) {
    // Reference vault oracles
    return matches[1];
  } else {
    return matches[1].split(" ")[0];
  }
}

function generateOracleObject(table) {
  const oracle = {};

  const values = [];

  for (let i = 0; i < table.length; i++) {
    const row = table[i];
    const floor = row["Floor"], ceiling = row["Ceiling"];
    let value = row["Result"];

    // skip invalid options
    if (!floor && !ceiling) continue;
    // remove unnecessary Markdown formatting
    value = convertMarkdown(value);

    const obj = {
      id: floor,
      value,
      pointer: null,
    };

    values.push(value);

    oracle[floor] = obj;

    const range = ceiling - floor;

    for (let j = 1; j <= range; j++) {
      const id = floor + j;
      const obj = {
        id,
        pointer: floor,
      };
      oracle[id] = obj;
    }
  }

  return {
    ...oracle,
    all: values,
  };
}

export function createOracle(base_oracle) {
  if (!base_oracle || typeof base_oracle !== "object") {
    throw new Error("Oracle is undefined");
  }
  const table = base_oracle["Table"];

  // If no Table key, must have multiple Oracles nested
  if (!table) {
    const oracles = base_oracle["Oracles"];
    const result = {};

    for (const oracle of oracles) {
      const key = oracle["Name"].toLowerCase();
      const table = oracle["Table"];

      result[key] = generateOracleObject(table);
    }
    return result;
  }
  return generateOracleObject(table);
}
