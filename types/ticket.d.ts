import { APIEmbedField, ButtonStyle, ColorResolvable } from "discord.js";

export interface TicketCategory {
  name: string;
  desc?: string;
  emoji?: string;
  categoryId: string;
  buttonColor?: ButtonStyle;
}

export interface SelectorConfig {
  customId: string;
  placeholder: string;
  message: string;
  alreadyOpenCategory: string;
}

export interface MessageConfig {
  color: ColorResolvable | null;
  title: string;
  desc: string;
  thumbnail: string | null;
  image: string | null;
  selector: SelectorConfig;
  autoFields: boolean;
  customFields?: APIEmbedField[];
  selectorType: "list" | "buttons";
}

export interface CloseConfig {
  customId: string;
  label: string;
  delay: number;
  message: string;
}

export interface TranscriptConfig {
  channelId: string;
  limit: number;
  message: string;
}

interface TicketFirstMessage {
  content?: string | null;
  embed?: string | null;
}

export interface TicketConfig {
  guildId: string;
  channelId: string;
  message: MessageConfig;
  tickets: TicketCategory[];
  ticketChannelName: string;
  ticketFirstMessage?: TicketFirstMessage | null;
  ticket_close: CloseConfig;
  transcript: TranscriptConfig;
}
