import fs from "fs";
import sharp from "sharp";
import { IMAGES } from "./constants";

export const processImage = async (image_data: string) => {
	try {
		image_data = image_data.replace(/^data:image\/png;base64,/, "");

		const buffer = Buffer.from(image_data, "base64");

		const processedImage = await sharp(buffer)
			.resize(28, 28)
			.modulate({
				brightness: 2,
				saturation: 1,
				hue: 0,
			})
			.greyscale()
			.toBuffer();

		const processedImageBase64 = processedImage.toString("base64");

		// Save the processed image to a file
		fs.writeFileSync("processed.png", processedImage);

		return processedImageBase64;
	} catch (error) {
		return null;
	}
};

export const getRandomImage = (count: number) => {
	if (count < IMAGES.length) {
		return IMAGES[count];
	}

	const randomIndex = ~~(Math.random() * IMAGES.length);
	return IMAGES[randomIndex];
};
