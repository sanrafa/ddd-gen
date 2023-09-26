import {
  createFile,
  createOracle,
  findById,
  findByName,
  getOriginalJSON,
} from "./helpers.js";

function generateStarOracle(root_oracles) {
  const json = findById("Starforged/Oracles/Space", root_oracles);
  if (!json) throw new Error("Unable to generate Star oracle");
  
  const oracles = json["Oracles"];

  const star_oracle = findById(
    "Starforged/Oracles/Space/Stellar_Object",
    oracles,
  );

  return createOracle(star_oracle);
}

function generateSettlementOracles(root_oracles) {
  const json = findById("Starforged/Oracles/Settlements", root_oracles);
  if (!json) throw new Error("Unable to generate Settlement oracles");
  const oracles = json["Oracles"];

  // We only want some of these
  const oracle_names = [
    "Name",
    "Location",
    "Population",
    "Authority",
    "Projects",
    "First Look",
    "Trouble",
  ];

  const settlement_oracles = oracle_names.map((name) => {
    const key = name.split(" ").join("_").toLowerCase();
    const entry = findByName(name, oracles);
    const value = createOracle(entry);
    return [key, value];
  });

  if (!settlement_oracles.every(([_k, v]) => !!v)) {
    throw new Error("Invalid settlement oracle name used.");
  }

  return Object.fromEntries(settlement_oracles);
}

function generatePlanetOracles(root_oracles) {
  const json = findById("Starforged/Oracles/Planets", root_oracles);
  if (!json) throw new Error("Unable to generate Planet oracles");
  
  const oracles = json["Oracles"];
  const categories = json["Categories"];


  const result = {};

  // Planetary Types (Class)
  const types_oracle = createOracle(findByName("Class", oracles));
  result["types"] = types_oracle;

  for (const category of categories) {
    const root_key = category["Name"].toLowerCase();
    const obj = {};
    for (const oracle of category["Oracles"]) {
      const key = oracle["Name"].split(" ").join("_").toLowerCase();
      obj[key] = createOracle(oracle);
    }
    obj["images"] = category["Display"]["Images"];
    obj["names"] = category["Sample Names"];
    result[root_key] = obj;
  }

  return result;
}

function generateCoreOracles(root_oracles) {
  const json = findById("Starforged/Oracles/Core", root_oracles);
  if (!json) throw new Error("Unable to generate Core oracles.");
  const oracles = json["Oracles"];
  const result = {};
  for (const oracle of oracles) {
    const key = oracle["Name"].toLowerCase();
    result[key] = createOracle(oracle);
  }

  return result;
}

function generateVaultOracles (root_oracles) {
  const json = findById("Starforged/Oracles/Vaults", root_oracles);
  if (!json) throw new Error("Unable to generate Vault oracles.");
  const oracles = json["Oracles"];
  const result = {};

  for (const oracle of oracles) {
    const key = oracle["Name"].split(" ").join("_").toLowerCase();
    result[key] = createOracle(oracle);
  }

  return result;
}

async function main() {
  console.log("Generating JSON...");

  const files = {
    stars: generateStarOracle,
    settlements: generateSettlementOracles,
    planets: generatePlanetOracles,
    core: generateCoreOracles,
    vaults: generateVaultOracles
  };

  try {
    const all_oracles = await getOriginalJSON();

    const generated = Object.entries(files).map((
      [k, f],
    ) => [k, f(all_oracles)]);

    generated.forEach(([k, v]) => createFile(k, v));

    return;
  } catch (err) {
    console.error(err);
  }
}

main();
