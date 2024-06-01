import sharp from "sharp";
import { IMAGES } from "./constants";

export const processImage = async (image_data: string) => {
	try {
		image_data = image_data.replace(/^data:image\/png;base64,/, "");

		const buffer = Buffer.from(image_data, "base64");

		const processedImage = await sharp(buffer).resize(28, 28).greyscale().threshold(50).toBuffer();

		const processedImageBase64 = processedImage.toString("base64");

		return processedImageBase64;
	} catch (error) {
		return null;
	}
};

export const getRandomImage = () => {
	const randomIndex = ~~(Math.random() * IMAGES.length);
	return IMAGES[randomIndex];
};
