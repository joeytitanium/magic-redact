export type DiscordMessageEmbedField = {
  name: string;
  value: string;
  inline: boolean;
};

export type DiscordMessageEmbeds = {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordMessageEmbedField[];
  image?: {
    url: string;
    proxy_url?: string;
    width?: number;
    height?: number;
  };
  timestamp?: string;
};

export type DiscordMessage = {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordMessageEmbeds[];
};
