/// <reference path="../types/index.d.ts" />

import "dotenv/config";

import assert from "assert";
assert.ok(process.env.TOKEN);

import { Client, GatewayIntentBits } from "discord.js";
import registerEvents from "../handlers/events";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

registerEvents(client);

client.login(process.env.TOKEN);
