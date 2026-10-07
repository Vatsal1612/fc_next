export interface DealSize {
  id: string;
  name: string;
}

export interface DealMenuItem {
  id: string;
  name: string;
  sizes: DealSize[];
}

export interface DealCategory {
  id: string;
  name: string;
  items: DealMenuItem[];
}

export const categories: DealCategory[] = [
  {
    id: "52238",
    name: "BURGER-",
    items: [
      {
        id: "365413",
        name: "Burger cheaa-",
        sizes: [
          {
            id: "515760",
            name: "Regular",
          },
          {
            id: "515759",
            name: "Large",
          },
        ],
      },
    ],
  },
];