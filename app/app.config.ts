type AppConfig = {
  charity: {
    colors: { hex: string; name: string }[];
    maxPerEvent?: number;
  };
  company: {
    name: string;
    privacyPolicyUrl: string;
    twitter: string;
    website: string;
  };
};

export default {
  charity: {
    colors: [
      { hex: "#f433ff", name: "pink" },
      { hex: "#ff5b00", name: "orange" },
      { hex: "#0165fc", name: "blue" },
      { hex: "#fff917", name: "yellow" }
    ],
    maxPerEvent: 4
  },
  company: {
    name: "Tabnine",
    privacyPolicyUrl: "https://www.tabnine.com/privacy",
    twitter: "tabnine",
    website: "https://www.tabnine.com/"
  }
} satisfies AppConfig;
