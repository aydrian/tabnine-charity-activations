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
      { hex: "#1f46c1", name: "bright blue" },
      { hex: "#ff2210", name: "bright red" },
      { hex: "#9465ec", name: "dev purple" },
      { hex: "#2ad5e7", name: "highlight" }
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
