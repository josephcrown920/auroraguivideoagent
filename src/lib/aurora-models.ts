export interface ModelOption {
  id: string;
  label: string;
  vendor: string;
}

export const IMAGE_MODELS: ModelOption[] = [
  { id: "seedream-5-0-260128", label: "Seedream 5.0", vendor: "ByteDance" },
  { id: "dola-seedream-5-0-pro-260628", label: "Dola Seedream 5.0 Pro", vendor: "ByteDance" },
  { id: "seedream-4-5-251128", label: "Seedream 4.5", vendor: "ByteDance" },
  { id: "seedream-4-0-20260415", label: "Seedream 4.0", vendor: "ByteDance" },
  { id: "seedream-3-0-t2i-250415", label: "Seedream 3.0", vendor: "ByteDance" },
];

export const VIDEO_MODELS: ModelOption[] = [
  { id: "dreamina-seedance-2-5-260628", label: "Seedance 2.5", vendor: "Dreamina" },
  { id: "dreamina-seedance-2-0-260128", label: "Seedance 2.0", vendor: "Dreamina" },
  { id: "dreamina-seedance-2-0-fast-260128", label: "Seedance 2.0 Fast", vendor: "Dreamina" },
  { id: "dreamina-seedance-2-0-mini-260615", label: "Seedance 2.0 Mini", vendor: "Dreamina" },
  { id: "seedance-1-5-pro-251215", label: "Seedance 1.5 Pro", vendor: "ByteDance" },
  { id: "seedance-1-0-pro-250528", label: "Seedance 1.0 Pro", vendor: "ByteDance" },
  { id: "seedance-1-0-pro-fast-251015", label: "Seedance 1.0 Pro Fast", vendor: "ByteDance" },
  { id: "seedance-1-0-lite-t2v-250428", label: "Seedance 1.0 Lite", vendor: "ByteDance" },
];

export const CHAT_MODELS: ModelOption[] = [
  { id: "agent", label: "Aurora Creative Director", vendor: "Aurora" },
  { id: "seed-2-0-pro-260328", label: "Seed 2.0 Pro", vendor: "ByteDance" },
  { id: "seed-2-0-lite-260428", label: "Seed 2.0 Lite", vendor: "ByteDance" },
  { id: "seed-2-0-mini-260428", label: "Seed 2.0 Mini", vendor: "ByteDance" },
  { id: "dola-seed-2-1-turbo-260628", label: "Dola Seed 2.1 Turbo", vendor: "ByteDance" },
  { id: "seed-1-8-251228", label: "Seed 1.8", vendor: "ByteDance" },
  { id: "deepseek-v4-pro-ga-260813", label: "DeepSeek V4 Pro", vendor: "DeepSeek" },
  { id: "deepseek-v4-flash-ga-260731", label: "DeepSeek V4 Flash", vendor: "DeepSeek" },
  { id: "glm-5-3-flash-260828", label: "GLM 5.3 Flash", vendor: "Z.AI" },
  { id: "glm-5-2-260617", label: "GLM 5.2", vendor: "Z.AI" },
];

export function modelLabel(id: string, list: ModelOption[]): string {
  return list.find((m) => m.id === id)?.label ?? id;
}
