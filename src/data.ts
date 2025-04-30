export default {
  guildId: "",
  channelId: "",

  message: {
    title: "🎟️ Ticket Dashboard",
    desc: "Choose a category to open your ticket",
    thumbnail: null,
    image: null,
    selector: {
      customId: "ticket",
      placeholder: "Choose a category",
      message: "You opened a **${ticket}** ticket, check the channel ${channel}",
      alreadyOpenCategory: "You already have an open **${ticket}** ticket. Check ${channel}"
    },
  },

  tickets: [
    {
      name: "🛠️ Support",
      desc: "Request support for general issues",
      categoryId: "",
    },
    {
      name: "⛔ Ban",
      desc: "Open a ticket if you believe your ban is unfair",
      categoryId: "",
    },
    {
      name: "💸 Donations",
      desc: "Open a ticket to make a donation",
      categoryId: "",
    },
  ],

  ticketFirstMessge: "${user} you opened a ${ticketType} ticket\nStaff will assist you shortly!",

  ticket_close: {
    customId: "ticket_close",
    label: "Close",
    delay: 5000,
    message: "The ticket will be closed in 5 seconds...",
  },

  transcript: {
    channelId: "",
    limit: 100, // limit of messages
    message: "📄 Transcript of the **#${ticket}** ticket closed by ${user}",
  },
};