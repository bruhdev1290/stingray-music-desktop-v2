export interface ThemeProperties {
  [key: `--${string}`]: string;
}

export interface Theme {
  id: string;
  name: string;
  thumbnailColor?: string;
  thumbnailImage?: string;
  properties?: ThemeProperties;
}
