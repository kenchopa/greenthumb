export default function parseJson(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Error while parsing to json: ${error}`);
  }
}
