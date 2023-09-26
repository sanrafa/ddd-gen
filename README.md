⚠ _Work in progress_ ⚠ 

# DDD-Gen

_**DDD**_ stands for "Dumbed-Down Dataforged". [Rsek](https://github.com/rsek) did amazing work on the [official Dataforged repo](https://github.com/rsek/dataforged), but I found the API a bit heavyweight for my own use. This is a simplified (and incomplete) version focused on reformatting the oracle tables.

The generated JSON files reside in `/dist`, the rest is the Node script that creates them.

## API

This was created for personal use, so not all oracle categories/tables have been adapted.

### Oracle Table

Each oracle table is an object. Keys are integers corresponding to a dice roll, values follow this interface:

```typescript
  interface OracleRow {
    id: number, // dice roll value
    pointer: null | number,
    value?: string
  }
```
- `id` is just the object's key
- `pointer` is null if the object has a `value` field, otherwise it's a number corresponding to the `id` of the object containing the value for that roll
- `value` is a string, the result of that roll

Oracle table objects also have an `all` key, an array listing all possible `value` strings.

### `stars.json`

### `settlements.json`

### `planets.json`


## LICENSE

All data in this project is based on [Ironsworn: Starforged](https://www.ironswornrpg.com), created by Shawn Tomkin, and licensed for use under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license](https://www.creativecommons.org/licenses/by-nc-sa/4.0/).

Credit to the original [Dataforged project](https://github.com/rsek/dataforged), maintained by Rsek.

The code in this repository is made available under the MIT License.
