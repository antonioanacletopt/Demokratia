import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  descriptionKey: string;
  imageUrl: string;
  imageHintKey: string;
};

export const PlaceHolderImages: Omit<ImagePlaceholder, 'description' | 'imageHint'>[] = data.placeholderImages;
