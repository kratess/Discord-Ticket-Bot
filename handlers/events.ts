import path from "node:path";
import fs from "node:fs";
import type { Client } from "discord.js";

// Function to recursively get all .ts files in a directory and subdirectories
function getEventFiles(directory: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(directory);

  for (const file of list) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recursively search in subdirectories
      results = results.concat(getEventFiles(filePath));
    } else if (file.endsWith(".ts")) {
      // Add the file to the results if it's a .ts file
      results.push(filePath);
    }
  }

  return results;
}

export default async function registerEvents(client: Client) {
  const eventsPath = path.join(__dirname, "../events");
  console.log(eventsPath);

  // Get all .ts files recursively from the events directory
  const eventFiles = getEventFiles(eventsPath);

  for (const file of eventFiles) {
    const event = await import(file);

    if (event.default.once) {
      client.once(event.default.name, (...args) =>
        event.default.execute(...args)
      );
    } else {
      client.on(event.default.name, (...args) =>
        event.default.execute(...args)
      );
    }
  }
}