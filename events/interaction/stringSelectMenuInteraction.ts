import { Events, StringSelectMenuInteraction } from "discord.js";
import data from "../../src/data";
import { openTicket } from "../../services/ticket";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: StringSelectMenuInteraction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== data.message.selector.customId) return;

    const ticketName = interaction.values[0];
    if (!ticketName) return;

    openTicket(interaction, ticketName)
  }
};
